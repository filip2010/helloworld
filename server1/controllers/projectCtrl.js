var templateCtrl =          require('./templateCtrl.js')
    , zip =                 require('../services/zipService.js')
    , tree =                require('../services/treeService.js')
    , fs =                  require('fs')
    , rimraf =              require('rimraf')
    , path =                require('path')
    , multiparty =          require('multiparty')
    , async =               require('async')
    , Project =             require('../models/projectModel.js')
    , InitializeProject =   require('../services/initializeProject.js')
    , Deployment =          require('../services/deployment.js')                          
    , DeleteProject =       require('../services/deleteProject.js')
    , exec =                require('child_process').exec;


function ProjectCtrl(io){

    var initializeProject = new InitializeProject(io); 
    var deployment =        new Deployment(io); 
    var deleteProject =     new DeleteProject(io); 

    
    this.getProjectFiles = function(req, res){
        if (!req.params[0])
            var sourcePath = path.join('./server/users', req.params.username, 'projects', req.params.projectName);
        else
            var sourcePath = req.params[0];
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

    this.createProject = function(req, res){
        if (req.body.templateId)
            templateCtrl.getTemplateNameById(req.body.templateId, function(err, templateName){
                if (err) throw err;
                if (templateName){
                    req.body.templateName = templateName;
                    createProjectAfterOptionsConfirmed(req, res);
                }
                else
                    return res.send(400, 'template id given does not exist');
            })
        else if (req.body.templateName){
            templateCtrl.getTemplateIdByName(req.body.templateName, function(err, id){
                if (err) throw err;
                if (id)
                    createProjectAfterOptionsConfirmed(req, res);
                else
                    return res.send(400, 'template name given does not exists');
            })
        }
    }

    this.deleteProject = function(req, res){
        if (req.params.projectName){
            var projectSettings = {svn: 'Git', deployment: 'Heroku', projectName: req.params.projectName};
            var project = new Project(req.params.username, projectSettings);
  /*          deleteProject.delete(project, function(err){
                if (err)
                    return res.send(400, err);
                else*/
                    rimraf( path.join('./server/users', req.params.username, 'projects', req.params.projectName), function(err){
                        if (err){
                            if (err.code == 'ENOENT')
                                return res.send(400, 'the project does not exists')
                            throw err;
                        }
                        else{
                            return res.send(200);
                        }
                    })                                               
            //})
        }
        else
            return res.send(400, 'no project name was specified');
    }

    this.getProjectTree = function(req, res){
        var sourceDir = path.join('./server/users', req.params.username, 'projects', req.params.projectName);
        console.log("project dir " + sourceDir);
        tree.createDirTree(sourceDir, null, function(err, tree){
            if (err)
                {
                    console.log("error occured " + err);
                }
            else
            return res.json(tree);
        });
    }

    this.updateFiles = function(req, res){
        return handleUploadedFiles(req, res);
    }

    this.uploadFiles = function(req, res){
        return handleUploadedFiles(req, res);
    }

    this.getAllUserProjectsNames = function(req, res){
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
        var projectSettings = {svn: 'Git', deployment: 'Amazon', templateName: req.body.templateName, projectName: req.body.projectName};
        var project = new Project(req.body.username, projectSettings);
        var randomPort = Math.floor((Math.random()*4000)+3000);
 
        exec('node server.js ', {cwd: path.resolve('server/users', project.username, 'projects', project.name, "server.js")}, function(err, stdout, stderr){
            exec('node server.js ' + randomPort, {cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
                if (err){
                    console.log(err);
                    return res.send(400, 'failed to run your application');
                }
                else{
                    console.log(stdout);
                    return res.send(200, 'http://' + process.env.serverIp + ":" + randomPort);
                }
 
        if (process.env['environment'] == 'dev'){
            (function windowsDeploy(randomPort) {
                exec('forever start -c node server.js ' + randomPort, {cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
                    if (err){
                        console.log(randomPort, " is occupied");
                        randomPort = Math.floor((Math.random()*4000)+3000);
                        windowsDeploy(randomPort);
                        //return res.send(400, 'failed to run your application');
                    }
                    else{
                        console.log(stdout);
                        return res.send(200, 'http://' + process.env.serverIp + ":" + randomPort);
                    }
                });
            })(randomPort);
        }
        else if (process.env['environment'] == 'prod')
            exec('forever stop server.js', {cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
                exec('forever start server.js ' + randomPort, {cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
                    if (err){
                        console.log(err);
                        return res.send(400, 'failed to run your application');
                    }
                    else{
                        return res.send(200, 'http://' + process.env.serverIp + ":" + randomPort);
                        console.log(stdout);
                    }
                })
 
            })
 
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
/*                            var projectSettings = {svn: 'TEST',  deployment: 'Amazon',     templateName: req.body.templateName, projectName: req.body.projectName};
                            var project = new Project(req.body.username, projectSettings);
                            if (Object.prototype.toString.call(project) == '[object Error]')
                                return res.send(500, project.message);*/
                            else
/*                                initializeProject.initialize(project, function(err){
                                    if (err){
                                        io.sockets.emit('createProjectError', {error: 'Creating your new project has failed'});                                        
                                        rimraf(path.join('./server/users', req.body.username, 'projects', req.body.projectName), function(error){
                                            if (error) throw error;
                                            else
                                                return res.send(500, err);
                                        });
                                    }
                                    else{
                                        io.sockets.emit('createProjectSuccess', {success: 'Created your new project succesfully'});
                                        return res.send(200);
                                    }
                                });*/
                                return res.send(200);
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
}

module.exports = ProjectCtrl;
   
