var     util =                  require('util')
        , Deployment =          require('./deploymentModel.js')
        , Svn =                 require('./svnModel.js')
        , util =                require('util')
        , templateCtrl =        require('../controllers/templateCtrl.js')
        ,  mkdirp            =  require("mkdirp")
        ,  EventEmitter       = require('events').EventEmitter
        ,  path         =       require('path')
        ,  fsextra =            require('fs.extra')
        ,  fs  =                require("fs");
//Element

 
 var createProject = function(projectSettings, callback){
       
             
        var projectPath =  Project.privateUtils.pathBuilder(projectSettings.username, projectSettings.projectName);
        projectSettings.path = projectPath;
        Project.privateUtils.createProjectFromTemplate( projectPath, 
        projectSettings.templateId ,function(err){
           var projectIns = {};
          if (!err)
          {
            
            
            projectIns.username       = projectSettings.username;
            projectIns.templateName   = projectSettings.templateName;
            projectIns.projectName    = projectSettings.projectName;
            projectIns.creatonDate    = new Date();
            projectIns.lastModifed    = this.creationDate;
            projectIns.path           =  projectSettings.path;
            projectIns.description    =  projectSettings.description;
            projectIns.notifications = 0; 
            console.log("in project constructor");

          }
             callback.call(null, projectIns, err);
        }); 

    }
 
var Project = {}
Project.createProject = createProject;
Project.privateUtils = 
      {
         readTemplatesMeta : function(callback, templatesPath)
         {
            if (callback)
            callback();

         },
         templateIdtoName : function(templateID , callback)
         {

          if (!templateCtrl) throw "templateCtrl is undefined";
            var templateName =  templateCtrl.getTemplateNameById(templateID, callback);
             
            return templateName;
         },

          templatePathBuilder : function(templateID)
          {
             
             var templateName =  templateCtrl.getTemplateNameById(templateID);
             console.log("[templatePathBuilder] templateName " + templateName);
             var templatePath = path.join('./server/templates', templateName, 'files');

            return templatePath;
          },

          pathBuilder : function (username, projectName, options)
          {
              var projectPath  = path.join('./server/users',  username, 'projects',  projectName);
              return projectPath;

          },

           createProjectFromTemplate: function(projectPath, templateId ,callback){

              
              mkdirp(projectPath , function(err){
                    if (err)
                     callback.apply(project,  'a project with the same projectName already exists, error:' + JSON.stringify(err));

                      var templatePath = Project.privateUtils.templatePathBuilder(templateId);
                      fsextra.copyRecursive(templatePath, projectPath, function(err)
                        {
                         callback.apply(projectPath, err);
                        });
             });

             
         },

         copyFromTemplate: function(templatePath , projectPath , callback){
                    console.time("copyFromTemplate");
                    fsextra.copyRecursive(templatePath, projectPath, function(err)
                    {
                         callback.apply(null, err);
                         var d1 = new Date();
                         console.timeEnd("copyFromTemplate");
                    })

          }  ,

          deleteProject : function (project ,callback)
          {
                fsextra.rmrf( project.path, function(err)
                    {
                         callback.apply(project, err);
                  })
          }                   
            
      }//private Utils
 util.inherits(Project, EventEmitter);
 


 

Project.prototype.save = function(callback)
{
   var fs = require("fs");
   var dotFresh =  this.path  + "/.fresh" ;
   var self = this;
   fs.mkdir(dotFresh , function(err)
   {
        console.log(".fresh was created on " + self.path);
        fs.writeFile(dotFresh + "/config.json" , JSON.stringify(self), callback);
    });
      
}

Project.prototype.modify = function()
{
    this.lastModified =  new Date();
}

module.exports = Project;


