var     fs =                require('fs')
        , async =           require('async')
        , path =            require('path')
        , exec =            require('child_process').exec
        , spawn =           require('child_process').spawn;

var DeploymentProviderVisitor = function(io){
    
    this.visitHeroku = function(heroku, project, callback){
        heroku.push(io, 'deployProject' , project, function(err){
            if (err){
                console.log(err);
                callback("system was not able to make the deployment to heroku");
            }
            else
                callback(null);
        });
    }

    this.visitAmazon = function(amazon, project, callback){
        console.log(amazon.name);
        exec('node server.js', {cwd: path.resolve('server/users', project.username, 'projects', project.name)},
         function(err, stdout, stderr){
            if (err)
                callback("system was not able to initialize deployment settings");
             
                           
                });  
    }

};

module.exports = DeploymentProviderVisitor;