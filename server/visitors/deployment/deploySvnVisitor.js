var     fs =                require('fs')
        , async =           require('async')
        , path =            require('path')
        , exec =            require('child_process').exec
        , spawn =           require('child_process').spawn;

var DeploymentSvnVisitor = function(io){
    
    this.visitGit = function(git, project, callback){
        exec('git add -A', {cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
            if (err)
                callback("system was not able to initialize deployment settings");
            else
                exec('git config --local user.name ' + project.username, {cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
                    if (err)
                        callback("system was not able to initialize deployment settings");
                    else
                        exec('git config --local user.email example@gmail.com', {cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
                            if (err)
                                callback("system was not able to initialize deployment settings");
                            else
                                exec('git commit -m "new commit"', {cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
                                    if (err){
                                        var patt = /nothing to commit/m;
                                        if (patt.test(stdout))
                                            callback("no changes to commit. your deployment is up to date")
                                        else
                                            callback("system was not able to initialize deployment settings");
                                    }
                                    else
                                        callback(null);
                                }) 
                        }) 
                           
                })                           
        }) 
    }

};

module.exports = DeploymentSvnVisitor;