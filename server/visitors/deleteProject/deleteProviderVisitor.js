var     fs =                require('fs')
        , async =           require('async')
        , path =            require('path')
        , exec =            require('child_process').exec
        , spawn =           require('child_process').spawn;

var DeploymentProviderVisitor = function(io){
    
    this.visitHeroku = function(heroku, project, callback){
        heroku.delete(io, null, project, function(err){
            if (err){
                console.log(err);
                callback("system was unable to delete the app from heroku");
            }
            else
                callback(null);
        });
    }

    this.visitAmazon = function(amazon, project, callback){
        console.log(amazon.name);
    }

};

module.exports = DeploymentProviderVisitor;