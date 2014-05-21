var     util =                  require('util')
        , Deployment =          require('./deploymentModel.js')
        , Svn =                 require('./svnModel.js');


//Element
var Project = function(projectSettings){

  

    this.username       = projectSettings.username;
    this.templateName   = projectSettings.templateName;
    this.projectName    = projectSettings.projectName;
    this.creatonDate    = new Date();
    this.lastModifed    = this.creationDate;
    this.path           = projectSettings.filePath ;
    this.description    = projectSettings.description;
    this.notifications = 0; 

};

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


