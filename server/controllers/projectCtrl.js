var templateCtrl =          require('./templateCtrl.js')
    , zip =                 require('../services/zipService.js')
    , tree =                require('../services/treeService.js')
    , fs =                  require('fs')
    , rimraf =              require('rimraf')
    , path =                require('path')
    , multiparty =          require('multiparty')
    , async =               require('async')
    , Project =             require('../models/projectModel.js')
    , ProjectsRepository =  require('../models/ProjectsRepository.js')
    , InitializeProject =   require('../services/initializeProject.js')
    , Deployment =          require('../services/deployment.js')                          
    , DeleteProject =       require('../services/deleteProject.js')
    , _=                    require("underscore")
    , exec =                require('child_process').exec
    , AWSDeploy =           require('../services/awsDeploy.js');



function ProjectCtrl(io){

    var initializeProject = new InitializeProject(io); 
    var deployment =        new Deployment(io); 
    var deleteProject =     new DeleteProject(io); 

    
    this.getProjectFiles = function(req, res){
        if (!req.params.file)
            var sourcePath = path.join('./server/users', req.params.username, 'projects', req.params.projectName);
        else
            var sourcePath = req.params.file;
        fs.stat(sourcePath, function(err, stats){
            if (err){
                if (err.code == 'ENOENT')
                    return res.send(400, 'file or dir does not exist')
                throw err;
            }
            else if (stats && stats.isFile())
                fs.readFile(sourcePath, function(err, data){
                      var ret = {}
                      ret.data = data;
                      return res.send(data);
                });
            else{
                var destPath = path.join('./server/users', req.params.username, 'projects', req.params.projectName, 'files.zip');
                zip.createZip(sourcePath, destPath, null, null, function(err){
                    if (err){
                        if (err.code == 'ENOENT')
                            return res.send(400, 'project does not exist')
                        throw err;
                    }
                    res.sendfile(destPath, function(err){
                        rimraf(destPath, function(err){
                          if (err) throw err;
                        });
                    }) 
                });                
            }
        });
    }
    this.openProject = function(req, res){
        if (req.params.projectName)
        {
           if (!req.user)
                req.user = {username : "itai"}  ;

            var sourceDir = path.join('./server/users', req.user.username, 'projects', req.params.projectName);
            console.log("project dir " + sourceDir);
            tree.createDirTree(sourceDir, null, function(err, tree){
                if (err) 
                    {
                        console.log("error occured " + err);
                        return res.send(400, "error : " + req.params.projectName + "does not exist");
                    }
                else 
                    return    res.json( _.extend ({username:req.user.username},{projectName: req.params.projectName},  {filesTree: tree}));
                
            });     
        }else 
        res.error("internal : projectName was not provided")
    }
    this.createProject = function(req, res){
        req.params =_.extend(req.params || {}, req.query || {}, req.body || {});

        if (req.body.templateId)
        {
            if (!req.user)
               req.user = {username:"itai"};
 
              /*
                        this.username       = projectSettings.username;
                        this.templateName   = projectSettings.templateName;
                        this.projectName    = projectSettings.projectName;
                        this.creatonDate    = new Date();
                        this.lastModifed    = this.creationDate;
                        this.path           = projectSettings.filePath ;
                        this.description =   projectSettings.description;
               */
               ProjectsRepository.createProject(
                        {
                            projectName : req.params.projectName ,
                            description: "node.js project" , 
                            username : req.user.username ,
                            "templateId" : req.params.templateId

               }, function(project)
                  {

                      res.json(project);

                  });
         }else
            return res.send(400, 'template id given does not exist');


    }

    this.deleteProject = function(req, res){
        console.log("project to delete is " + req.params.projectName)  ;
        if (req.params.projectName){

            var options = {projectName : req.params.projectName };
            ProjectsRepository.deleteProject(options);

            rimraf( path.join('./server/users', req.params.username, 'projects', req.params.projectName),
             function(err){
                        if (err){
                            if (err.code == 'ENOENT')
                                return res.send(400, 'the project does not exists')
                            throw err;
                        }
                        else{
                            return res.send(200);
                        }
                    })                                               
             
        }
        else
            return res.send(400, 'no project name was specified');
    }

    this.getProjectTree = function(req, res){
        if (!req.params.username)
           req.params.username = "itai";
        var sourceDir = path.join('./server/users', req.params.username, 'projects', req.params.projectName);
        console.log("project dir " + sourceDir);
        tree.createDirTree(sourceDir, null, function(err, tree){
            if (err) 
                {
                    console.log("error occured " + err);
                }
            else   {  

         
          return    res.json( _.extend ({username:req.params.userName},{projectName: req.params.projectName},  {filesTree: tree}));
            
           }
        });
    }


    this.updateFiles = function(req, res){
        return handleUploadedFiles(req, res);
    }

    this.uploadFiles = function(req, res){
        return handleUploadedFiles(req, res);
    }
 
    this.updateFile = function(req, res)
    {
        req.params =_.extend(req.params || {}, req.query || {}, req.body || {});
        if (!req.params.username)
             req.params.username = "itai";

        var projectSettings = {templateName: req.body.templateName, projectName: req.body.projectName};
        var project =  ProjectsRepository.getProject(projectSettings.projectName);
        var dir = path.join(req.params.filePath);
        
          console.log("added new file  " + dir);
         fs.writeFile(dir , req.params.fileContent , function (err) {
          if (err)
          {
              console.log("error occured during file save" + err + "[" +  (new Date()).toString() + "]");
              return res.send(400, "error occured during file save" + err);
          }
          console.log(dir + 'saved!'+ "[" +  (new Date()).toString() + "]");
          res.send(200, project);
        }); 
    }
    this.createNewFile = function(req, res)
    {
        req.params =_.extend(req.params || {}, req.query || {}, req.body || {});
        if (!req.username)
             req.username = "itai";
        var dir = path.join(req.params.filePath);
        
          console.log("added new file  " + dir);
         fs.writeFile(dir , req.params.fileContent , function (err) {
          if (err) throw err;
          console.log(dir + 'saved!');
          return res.send(200 , "file sucesfully have been saved");
        });
    }
    this.getAllUserProjectsNames = function(req, res){
        var user = (req.user)  ? req.user.username : "user not defined"   ;
        console.log("get user project , username : " +  user);
        if (!req.user  || req.user.username) {
            req.username =  "itai";
            console.log("user is not define , providing default user(itai) ");
        }

        return res.json({projects:  ProjectsRepository.getAllProjects({username:req.username})});
        fs.readdir(path.join('./server/users', req.params.username, 'projects'), function(err, dirs){
            if (err){
                if (err.code == 'ENOENT')
                    return res.send(400, 'user does not exist or does not have any projects');
                else
                    throw err;
            }
            return res.json({projectNames: dirs});
        });
    }

    this.deploy = function(req, res){
        var projectSettings = {templateName: req.body.templateName, projectName: req.body.projectName};
        if (!req.body.username)
            projectSettings.username = "itai";
        var project =  ProjectsRepository.getProject(projectSettings.projectName);

        if (req.body.provider == 'aws')
            amazonDeployment(project, req, res);
        else // local deplyoment
            localDeployment(project, req, res);
    }

    this.stopInstance = function(req, res){
        var projectSettings = {templateName: req.params.templateName, projectName: req.params.projectName};
        if (!req.params.username)
            projectSettings.username = "itai";
        console.log(projectSettings);
        var project =  ProjectsRepository.getProject(projectSettings);

        var projectSettings = {repository: 'https://bitbucket.org/lobengula3rd/third-demo.git', projectName: project.projectName};
        var awsUserDataPath = path.join('./server/users', project.username, 'projects', project.projectName, 'awsData.json');
        //itai account
        var awsDeploy = new AWSDeploy("AKIAIWZA7VO52VMQUDHA", "B1Y9LBnz0BfjcIi5zTavoO7pC/XAq6oyDwkqhutz", "eu-west-1", projectSettings, awsUserDataPath);


        awsDeploy.on('CreationError', function(err){
            console.log(err);
        });

        awsDeploy.on('Creation', function(){
            awsDeploy.stopInstance(function(err, data){
                if (err){
                    console.log(err);
                    return res.send(400, err);
                }
                else{
                    console.log(data);
                    return res.send(202, project);
                }
            });
        });

        awsDeploy.on('InstanceUpdatesStart', function(data) {
            io.sockets.emit('StopInstanceStart', {start: data});
            console.log(data);
        });

        awsDeploy.on('InstanceUpdates', function(data) {
            io.sockets.emit('StopInstanceUpdate', {update: data});
            console.log(data);
        });

        awsDeploy.on('InstanceUpdatesError', function(data) {
            io.sockets.emit('StopInstanceError', {error: data});
            console.log(data);
        });

        awsDeploy.on('InstanceUpdatesSuccess', function(data) {
            io.sockets.emit('StopInstanceSuccess', {success: data});
            console.log(data);
        });
    }

    this.describeInstances = function(req, res){
        var projectSettings = {templateName: req.params.templateName, projectName: req.params.projectName};
        if (!req.params.username)
            projectSettings.username = "itai";
        console.log(projectSettings);
        var project =  ProjectsRepository.getProject(projectSettings);

        var projectSettings = {repository: 'https://bitbucket.org/lobengula3rd/third-demo.git', projectName: project.projectName};
        var awsUserDataPath = path.join('./server/users', project.username, 'projects', project.projectName, 'awsData.json');
        //itai account
        var awsDeploy = new AWSDeploy("AKIAIWZA7VO52VMQUDHA", "B1Y9LBnz0BfjcIi5zTavoO7pC/XAq6oyDwkqhutz", "eu-west-1", projectSettings, awsUserDataPath);


        awsDeploy.on('CreationError', function(err){
            console.log(err);
        });

        awsDeploy.on('Creation', function(){
            awsDeploy.describeInstances(function(err, data){
                if (err){
                    console.log(err);
                    return res.send(400, err);
                }
                else{
                    project.instance = data.Instances;
                    console.log(data);
                    return res.send(200, project);
                }
            });
        });
    }

    /*exports.getProjectFiles = getProjectFiles;
    exports.createProject = createProject;
    exports.deleteProject = deleteProject;
    exports.getProjectTree = getProjectTree;
    exports.updateFiles = updateFiles;
    exports.uploadFiles = uploadFiles;
    exports.getAllUserProjectsNames = getAllUserProjectsNames;*/



    //internal functions

    var createProjectAfterOptionsConfirmed = function(req, res){

        req.params =_.extend(req.params || {}, req.query || {}, req.body || {});
        fs.mkdir( path.join('./server/users', req.body.username, 'projects', req.body.projectName), function(err){
            if (err){
                if (err.code == 'ENOENT')
                    return fs.mkdir( path.join('./server/users', req.body.username, 'projects'), function(err){
                        createProjectAfterOptionsConfirmed(req, res);
                    }); 
                if (err.code == 'EEXIST')
                    return res.send(400, 'a project with the same projectName already exists');
                throw err;          
                //return res.send(400, 'could not create new project');
            }
/*            if (req.body.yoGenerator)
                yo.createProjectByYoGenerator(req.body.yoGenerator, req.body.username, req.body.projectName, function(err, res){
                    if (err)
                        throw err;
                    else
                        return res.send(200);
                })*/
            else{
                var sourcePath = path.join('./server/templates', req.body.templateName, 'files');
                var destPath = path.join('./server/users', req.body.username, 'projects', req.body.projectName, 'files.zip');
                var specificFilesToAdd = {name: 'handler.js', path: path.join('./server/templates', req.body.templateName, 'handler.js')};

                zip.createZip(sourcePath, destPath, specificFilesToAdd, null, function(err){
                    if (err){
                        rimraf(path.join('./server/users', req.body.username, 'projects', req.body.projectName), function(error){
                            if (error) throw error;
                            if(err.code == "ENOENT")
                                return res.send(400, "template does not exist");
                            throw err;
                        });
                    } 
                    else 
                        zip.unzipAndDeleteZip(destPath, path.dirname(destPath), function(err){
                            if (err) throw err;
                            var projectSettings = {
                                username : req.body.username, 
                                templateName: req.body.templateName,
                                projectName: req.body.projectName,
                                filePath : path.dirname(destPath)};
                            var project = new Project(projectSettings , function(err){

                                console.log(project);
                            //Oleg :t workaround
                           
                            return res.send(projectSettings);
                            });
                             
                            /*if (Object.prototype.toString.call(project) == '[object Error]')
                                return res.send(500, project.message);
                            else
                                initializeProject.initialize(project, function(err){
                                    if (err){
                                        io.sockets.emit('createProjectError', {error: 'Creating your new project has failed'});                                        
                                        rimraf(path.join('./server/users', req.body.username, 'projects', req.body.projectName), function(error){
                                            if (error) throw error;
                                            if (error) throw error;
                                            else
                                                return res.send(500, err);
                                        });
                                    }
                                    else{
                                        io.sockets.emit('createProjectSuccess', {success: 'Created your new project succesfully'});
                                        return res.send(project);
                                    }
                                });*/
                        })
                });
            }        
        });
    }

    var handleUploadedFiles = function(req, res){
        var form = new multiparty.Form({uploadDir: './server/tempUploads'});
        form.on('error', function(err){
            if (err == 'Error: missing content-type header')
                return res.send(400, 'no file was attached with the request');
            else
                return res.send(500);
        });
        form.parse(req, function(err, fields, files) {
            var index = 0;
            async.eachSeries(files.filesUploaded, function(file, continuation){
                fs.rename(file.path, fields.filesUploadedPaths[index], function(err){
                    if (err) throw err;
                    index++;
                    continuation();
                })            
            },
            function(err){
                return res.send(200);
            });
        });
    }

    var localDeployment = function(project, req, res){
        var randomPort = Math.floor((Math.random()*4000)+3000);
        var execPath = path.resolve('server/users', project.username, 'projects', project.projectName);
        var serverIp;
        var attemps = 0;

        if (!process.env.serverIp)
            serverIp = "54.72.92.150";
        else
            serverIp = process.env.serverIp;
        if (!project.projectName)
            return res.send(400);
        if (process.env['environment'] == 'dev'){
            (function windowsDeploy(randomPort) {

                console.log("application will be deployed on port " + randomPort);

                var child = exec('node server.js ' + randomPort, {cwd:  execPath}, function(err, stdout, stderr){

                    if (err){
                        console.log("error:" + stderr + " occured");
                        randomPort = Math.floor((Math.random()*4000)+3000);
                        if (attemps > 5)
                            return res.send(400, 'failed to run your application' + stderr);
                        windowsDeploy(randomPort);
                        attemps++;

                    }
                    else{
                        console.log(stdout);
                        project.deployUrl = 'http://' + serverIp + ":" + randomPort;
                        return res.send(200,  project);
                    }

                });

                child.stdout.on('data', function (data) {
                    project.deployUrl = 'http://' + serverIp + ":" + randomPort;
                    return res.send(200,  project);
                });

            })(randomPort);
        }
        else if (process.env['environment'] == 'prod')
            exec('forever stop server.js', {cwd: path.resolve('server/users', project.username, 'projects', project.projectName)}, function(err, stdout, stderr){
                exec('forever start server.js ' + randomPort, {cwd: path.resolve('server/users', project.username, 'projects', project.projectName)},
                    function(err, stdout, stderr){
                        if (err){
                            console.log(err);
                            return res.send(400, 'failed to run your application');

                        }
                        else{
                            process.env.serverIp = "54.72.92.150";
                            return res.send(200, "http://54.72.92.150:" + randomPort);
                            console.log(stdout);
                        }
                    })
            })
    }

    var amazonDeployment = function(project, req, res){

        var projectSettings = {repository: 'https://bitbucket.org/lobengula3rd/third-demo.git', projectName: project.projectName};
        var awsUserDataPath = path.join('./server/users', project.username, 'projects', project.projectName, 'awsData.json');
        //itai account
        var awsDeploy = new AWSDeploy("AKIAIWZA7VO52VMQUDHA", "B1Y9LBnz0BfjcIi5zTavoO7pC/XAq6oyDwkqhutz", "eu-west-1", projectSettings, awsUserDataPath);


        awsDeploy.on('CreationError', function(err){
            console.log(err);
        });

        awsDeploy.on('Creation', function(){
            awsDeploy.deploy('deploy', function(err, data){
                if (err){
                    console.log(err);
                    return res.send(400, err);
                }
                else{
                    //project.deployUrl = data.
                    console.log(data);
                    return res.send(202, project);
                }
            });
        });


        awsDeploy.on('InstanceUpdatesStart', function(data) {
            io.sockets.emit('DeploymentStart', {start: data});
            console.log(data);
        });

        awsDeploy.on('InstanceUpdates', function(data) {
            io.sockets.emit('DeploymentUpdate', {update: data});
            console.log(data);
        });

        awsDeploy.on('InstanceUpdatesError', function(data) {
            io.sockets.emit('DeploymentError', {error: data});
            console.log(data);
        });

        awsDeploy.on('InstanceUpdatesSuccess', function(data) {
            io.sockets.emit('DeploymentSuccess', {success: data});
            console.log(data);
        });

        awsDeploy.on('DeploymentUpdatesStart', function(data) {
            io.sockets.emit('DeploymentStart', {start: data});
            console.log(data);
        });

        awsDeploy.on('DeploymentUpdates', function(data) {
            io.sockets.emit('DeploymentUpdate', {update: data});
            console.log(data);
        });

        awsDeploy.on('DeploymentUpdatesError', function(data) {
            io.sockets.emit('DeploymentError', {error: data});
            console.log(data);
        });

        awsDeploy.on('DeploymentUpdatesSuccess', function(data) {
            io.sockets.emit('DeploymentSuccess', {success: data});
            console.log(data);
        });

    }
}

module.exports = ProjectCtrl;
   
