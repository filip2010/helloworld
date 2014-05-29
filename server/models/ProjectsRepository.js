 
var     Project    =  require('./projectModel.js');
var     _          =  require("underscore");
var     path       =  require("path");
var     mkdirp     =  require("mkdirp");
var     fs          =  require("fs");
var     bitbucket  =   require("../services/bitBucket");
var     async      =   require("async");
//Element
var ProjectRepository = function(){

   var projects = [];
   
   var configPath = path.join("." , "server", ".fresh");
   if (!fs.existsSync(configPath))
      mkdirp.sync(configPath);
   
   this.setConfig = function(config)
   {

      if (config.path)
        configPath = config.path;
   }

   this.createProject = function (projectSettings, callback)
   {
     var project = new Project(projectSettings);
     var key = projectSettings.username + projectSettings.projectName;
     console.log("project save wtih key " +  key);

     projects.push(project);
    
         
     createGitRepostiory(project);

     async.series({
          createProject: function(callback){
             createGitRepostiory(project, function()
              { 
                callback(null, project.gitRepo)
              });
          },
          getIssues: function(callback){
             getProjectIssues(project, function(){
              callback(null, project.issues);
          })
        }
      },
      function(err, results) {
        if (!err)
          save(function(){console.log("projects repository was persisted")});
        else 
          throw "creation of project " + project.projectName  + "failed " + JSON.stringify(err);

      }); 
         
   }
   this.getProjectIssues = function(projectName, callback ,errorCallback)
   {
        if (!errorCallback)
          errorCallback = function(){throw "[getProjectIssues] error: can't find project " + projectName;}

        var project = this.getProject(projectName);
        var reponame;
        if (!project.gitRepo  || !project.gitRepo.repoName)
          reponame = "undefined";
        else 
          reponame = project.gitRepo.repoName;

        var options = {username: 'verchol', password: "oleg1314", repoName:  reponame};

        if (!project)
           errorCallback();

        function issuesCallback(err, res){
         if (err){
           if (err.body)
           console.log(err.body);
           else
           console.log(err);
           }
           else{
           console.log(res);
           project.issues =  res;
           if (callback)
           callback(res);
           //save(function(){console.log("projects repository was persisted")});
       }
     }

       bitbucket.getIssues(options, issuesCallback)
   }

   var createGitRepostiory = function(project)
   {
      var options = {username: 'verchol', password: "oleg1314", repoName: project.projectName};
      function callback(err, res){
         if (err){
         if (err.body)
         console.log(err.body);
         else
         console.log(err);
         }
         else{
         console.log(res);
         project.gitRepo =  res;
         save(function(){console.log("projects repository was persisted")});
       }
     }

        bitbucket.createRepo(options, callback);
   }
 
   this.getAllProjects = function(filter)
   {
    var ret = _.where(projects, filter);
     return ret; 
   }
   this.getProject = function(projectName)
   {
      if (typeof projectName !== "string") 
           throw "project name should be string only";
      var project = _.find(projects, function(p){
          return p.projectName === projectName});
      
      if (!project) throw "project does not exist";
      console.log("project found:" + projectName);

     return project;
   }

   this.deleteProject = function(options)
   {
       console.log("project was deleted");
       var index = -1;
       _.each(projects, function(element, i, list){
        if (options.projectName === element.projectName)
             index = i;
       });
       if (index!= -1)
       projects.splice(index, 1);
   }

   function printArray(array)
   {
     for (var prop in array) 
     {
        console.log(prop + "," + array[prop]);
     }  
   }
   function save(callback)
   {
       if (!callback)
        callback = function(err){
                  if (err) throw err;
                    console.log('It\'s saved!');
                  }
       var dotFresh =  path.join(configPath  ,".projects") ;
       printArray (projects);
       console.log("repoistory was saved : " + JSON.stringify(projects));
       fs.writeFile(dotFresh + "/projects.json" , JSON.stringify(projects), callback);
    
    }

    function load(callback)
    {
       
       var projectsPath = path.join(configPath , ".projects");
       var projectsFile = path.join(projectsPath, "projects.json");
       if (!fs.existsSync(projectsPath))
       {
             mkdirp.sync(projectsPath);
             fs.writeFileSync(projectsFile, JSON.stringify([]));
       }else
        if (!fs.existsSync(projectsFile))
            fs.writeFileSync(projectsFile, JSON.stringify([]));

        console.log("reading " + path.join(projectsPath , "projects.json"));
        var content = fs.readFileSync(path.join(projectsPath , "projects.json"));
        projects = JSON.parse(content);
        console.log("loaded projects" + JSON.stringify(projects));
    }

    load();

};

 
module.exports = new ProjectRepository();
