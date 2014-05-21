var     fs =            require('fs')
        ,async =        require('async')
        ,path =         require('path')
        ,exec =        require('child_process').exec;


function DeploymentService(io){ //implement visitor pattern


   this.startDeployment = function(username){
    
   };

   this.stopDeployment = function(username){

   };


   //perform specific actions on creation of a new project in context of the chosen deployment. for now svn is git 
   this.initialize = function(username, projectSettings, callback){
      svnInit(username, projectSettings, function(err){
         if (err)
            callback(err);
         else
            deploymentInit(username, projectSettings, function(err){
               if (err)
                  callback(err);
               else
                  callback(null);
            });
      });
   };

   var svnInit = function(username, projectSettings, callback){
      projectName = projectSettings.projectName;

      if (projectSettings.svn == 'git')
         child = exec('git init', {cwd: path.resolve('server/users', username, 'projects', projectName)}, function(err, stdout, stderr){
            if (err) 
               callback("system was not able to initialize deployment settings");
            else{
               //console.log(stdout);
               callback(null);            
            }
         })
      else
         callback('system can\'t handle the requested svn:' + projectSettings.svn);
   };

   var deploymentInit = function(username, projectSettings, callback){
      projectName = projectSettings.projectName;

      if (projectSettings.deployment == 'heroku'){
         var nodeTemplates = ['node.js', 'angular.js-node.js'];
         if (nodeTemplates.indexOf(projectSettings.templateName) != -1)
            fs.writeFile(path.resolve('server/users', username, 'projects', projectName, 'Procfile'), 'web: node server.js', function(err){
               if (err)
                  callback("system was not able to create the proc file for herkou deployment");
               else
                  callback(null);
            })
         else
            callback(null);
      }
      else
         callback('system can\'t handle the requested deployment:' + projectSettings.deployment);
   };

   this.init = function(username){

   };

   this.commit = function(username){

   };

   this.push = function(username){

   };

}


module.exports = DeploymentService;



