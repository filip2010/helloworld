var     fs =                require('fs')
        , async =           require('async')
        , path =            require('path')
        , exec =            require('child_process').exec
        , spawn =           require('child_process').spawn;

var amazonDeploymentVisitor = function(io){
    
    this.deploy = function(project, script,  callback ){
        exec('node server.js', {cwd: path.resolve('server/users', project.username, 'projects', project.name)},
         function(err, stdout, stderr){
            if (err)
                callback("system was not able to initialize deployment settings");
             
                           
                })                           
        }) 
     

};

module.exports = amazonDeploymentVisitor;