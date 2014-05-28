var     fs =                require('fs')
        , async =           require('async')
        , path =            require('path')
        , exec =            require('child_process').exec
        , spawn =           require('child_process').spawn;

var InitDeploymentVisitor = function(io){
    
    this.visitHeroku = function(heroku, project, callback){
        var nodeTemplates = ['node.js', 'angular.js-node.js'];
        if (nodeTemplates.indexOf(project.templateName) != -1)
            fs.writeFile(path.resolve('server/users', project.username, 'projects', project.name, 'Procfile'), 'web: node server.js', function(err){
                if (err)
                    callback("system was not able to create the proc file for herkou deployment");
                else                        
                    exec('heroku apps:create ' + project.name, {timeout: 30000, cwd: path.resolve('server/users', project.username, 'projects', project.name)}, function(err, stdout, stderr){
                        if (err){
                            var patt = /Name is already taken/m;
                            if (patt.test(stderr))
                                callback("Project name already exists in heroku. please choose a different");
                            else
                                callback("system was not able to create a new app at heroku:" + err);
                        } 
                        else{                            
                            callback(null);
                            heroku.push(io, 'createProject', project, function(err){
                                if (err){
                                    console.log(err);
                                    //callback("system was not able to make an initial deployment to heroku");
                                }
                                else{

                                    //callback(null);
                                }
                            })
                        }
                    }) 
            })
        else
            callback(null);
    }

    this.visitAmazon = function(amazon, project, callback){
        console.log(amazon.name);
    }

};

module.exports = InitDeploymentVisitor;

/*        console.log("starting deployment");
        io.sockets.on('connection', function (socket) {
            socket.emit('newsStart', { start: 'start' });
            socket.emit('newsUpdate', { update: 'update' });
            //socket.emit('newsError', { error: 'error' });
            socket.emit('newsSuccess', { success: 'success' });
            socket.on('my other event', function (data) {
                console.log(data);
            });
        });*/