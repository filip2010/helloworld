var     fs =                        require('fs')
        , InitSvnVisitor =          require('../visitors/initializeProject/initSvnVisitor.js')
        , InitDeploymentVisitor =   require('../visitors/initializeProject/initDeploymentVisitor.js');


var InitializeProject = function (io) {

    var initSvnVisitor = new InitSvnVisitor(io);

    var initDeploymentVisitor = new InitDeploymentVisitor(io);

    this.initialize = function(project, callback){
        io.sockets.emit('createProjectStart', {start: 'Starting initialization of your new project'});
        io.sockets.emit('createProjectUpdate', {update: 'Configuring your source control...'});
        if (project.deployment)
        project.svn.accept(initSvnVisitor, project, function(err){
            if (err)
                callback(err);
            else{
                io.sockets.emit('createProjectUpdate', {update: 'Finished configuring your source control'});
                io.sockets.emit('createProjectUpdate', {update: 'Making an initial deployment...'});
                project.deployment.accept(initDeploymentVisitor, project, function(err){
                    if (err)
                        callback(err);
                    else{
                        io.sockets.emit('createProjectUpdate', {update: 'Finished your initial deployment'});
                        callback(null);
                    }
                })                
            }
        })
    };
};


module.exports = InitializeProject;