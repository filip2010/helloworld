var     fs =                                require('fs')
        , DeleteProviderVisitor =           require('../visitors/deleteProject/deleteProviderVisitor.js');


var DeleteProject = function (io) {

    var deleteProviderVisitor = new DeleteProviderVisitor(io);

    this.delete = function(project, callback){
        project.deployment.accept(deleteProviderVisitor, project, function(err){
            if (err)
                callback(err)
            else{
                callback(null);            
            }
        })
    };
};


module.exports = DeleteProject;