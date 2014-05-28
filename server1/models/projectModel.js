var     util =                  require('util')
        , Deployment =          require('./deploymentModel.js')
        , Svn =                 require('./svnModel.js');


//Element
var Project = function(username, projectSettings){

    deployment = new Deployment();
    svn = new Svn();

    this.username = username;
    this.templateName = projectSettings.templateName;
    this.name = projectSettings.projectName;

    if (deployment.providers.indexOf(projectSettings.deployment) == -1)
        return new Error('system can\'t handle the requested deployment:' + projectSettings.deployment);
    this.deployment = new deployment[projectSettings.deployment];

    if (svn.providers.indexOf(projectSettings.svn) == -1)
        return new Error('system can\'t handle the requested svn:' + projectSettings.svn);
    this.svn = new svn[projectSettings.svn];

};


module.exports = Project;


