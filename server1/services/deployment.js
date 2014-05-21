var     fs =                                require('fs')
        , DeploymentProviderVisitor =       require('../visitors/deployment/deployProviderVisitor.js')
        , DeploymentSvnVisitor =            require('../visitors/deployment/deploySvnVisitor.js');
         



var Deployment = function (io) {

    var deploymentSvnVisitor = new DeploymentSvnVisitor(io);

    var deploymentProviderVisitor = new DeploymentProviderVisitor(io);
    

    this.deploy = function(project, callback){
        io.sockets.emit('deployProjectStart', {start: 'Starting deployment of your project'});
        io.sockets.emit('deployProjectStart', {start: 'Commiting your changes'});
        /*project.svn.accept(deploymentSvnVisitor, project, function(err){
            if (err)
                callback(err) 
            else {*/
                io.sockets.emit('deployProjectStart', {start: 'Commited Succesfully'});
                io.sockets.emit('deployProjectStart', {start: 'Deploying your project to heroku'});
                project.deployment.accept(deploymentProviderVisitor, project, function(err){
                    if (err)
                        callback(err);
                    else{
                        io.sockets.emit('deployProjectSuccess', {success: 'Finished deployment of your project'});
                        callback(null);
                    }
                })                
            
        }
    };
 


module.exports = Deployment;