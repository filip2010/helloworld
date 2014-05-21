var     fs =                require('fs')
        , async =           require('async')
        , path =            require('path')
        , exec =            require('child_process').exec;


var InitSvnVisitor = function(){
    this.visitGit = function(git, project, callback){
        child = exec('git init', {cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
            if (err)
                callback("system was not able to initialize deployment settings");         
            else
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
                                        exec('git commit -m "initial commit"', {cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
                                            if (err)
                                                callback("system was not able to initialize deployment settings");
                                            else
                                                callback(null);
                                        }) 
                                }) 
                                   
                        })                           
                })                      
        })
    }
};

module.exports = InitSvnVisitor;