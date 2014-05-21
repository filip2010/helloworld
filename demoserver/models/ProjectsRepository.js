var     util    =  require('util');
var     Project =  require('./projectModel.js');
var     _       =  require("underscore");
var     path    =  require("path");
var     mkdirp   =  require("mkdirp");
var     fs      =  require("fs");

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
     save(callback);
         
   }
 
   this.getAllProjects = function()
   {
     return projects; 
   }
   this.getProject = function(toFind)
   {
      var project = _.find(projects, function(p){return p.projectName === toFind.projectName});
      
      if (!project) throw "project does not exist";
      console.log("project found:" + project.projectName);

     return project;
   }

   this.deleteProject = function(projectName)
   {
       console.log("project was deleted")

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
       if (!fs.existsSync(projectsPath))
             mkdirp.sync(projectsPath);

        console.log("reading " + path.join(projectsPath , "projects.json"));
        var content = fs.readFileSync(path.join(projectsPath , "projects.json"));
        projects = JSON.parse(content);
        console.log("loaded projects" + JSON.stringify(projects));
    }

    load();

};

 
module.exports = new ProjectRepository();
