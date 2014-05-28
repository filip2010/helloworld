var     fs =                require('fs')
        , async =           require('async')
        , path =            require('path')
        , exec =            require('child_process').exec
        , spawn =           require('child_process').spawn;


var Deployment = function(deployment){
    this.providers = ['Heroku', 'Amazon'];

    this.Heroku = function(){
        this.accept = function(visitor, project, callback){
            visitor.visitHeroku(this, project, callback);
        }

        var herokuLogin = function(callback){
            var child = spawn(process.env.comspec, ['/c', 'heroku', 'login']);
            console.log("hola!");
            //console.log(child.stdio[3]);

            //child.stdout.pipe(process.stdout);
            //var pipe = child.stdio[0];
            //pipe.write('great')

            //child.stdio[1].pipe(process.stdout);
            //console.log(child);

            child.stdout.setEncoding('utf8');
            child.stdout.on('data', function(chunk){
                //child.send({bitch: "my bitch"})
                console.log(chunk);
                //console.log("\n");
                //child.stdin.write('shalom lecha');
            });

            child.on('error', function(err){
                console.log("error:", err);
                callback(err);
            })

            child.on('close', function(code){
                //console.log("here");
                console.log("closing: ", code);
                callback(null);
            })

            child.on('exit', function(code){
                console.log("exiting:", code);
                callback(null);
            })
        }

        this.push = function(io, eventName, project, callback){
            if (process.env['environment'] == 'dev')
                var child = spawn(process.env.comspec, ['/c', 'git push heroku master'], {cwd: path.resolve('server/users', project.username, 'projects', project.name), stdio: ['pipe', 'pipe', 'pipe']});
            else if (process.env['environment'] == 'prod')
                var child = spawn('git', ['push', 'heroku', 'master'], {cwd: path.resolve('server/users', project.username, 'projects', project.name), stdio: ['pipe', 'pipe', 'pipe']});

            child.stderr.setEncoding('utf8');
            child.stderr.on('data', function(chunk){
                //child.send({bitch: "my bitch"})
                console.log(chunk);
                io.sockets.emit(eventName + 'Update', {update: chunk});
                //console.log("\n");
                //child.stdin.write('shalom lecha');
            });
            

            child.on('error', function(err){
                console.log("error:", err);
               /* io.sockets.emit('deploymentError', {error: err});*/
                callback(err);
            })

            child.on('exit', function(code){
                console.log("exiting: ", code);
                callback(null);
            })
        }

        this.delete = function(io, eventName, project, callback){
            if (process.env['environment'] == 'dev')
                var child = spawn(process.env.comspec, ['/c', 'heroku apps:destroy --confirm', project.name], {cwd: path.resolve('server/users', project.username, 'projects', project.name), stdio: ['pipe', 'pipe', 'pipe']});
            else if (process.env['environment'] == 'prod')
                var child = spawn('heroku', ['apps:destroy', '--confirm', project.name], {cwd: path.resolve('server/users', project.username, 'projects', project.name), stdio: ['pipe', 'pipe', 'pipe']});

            child.stderr.setEncoding('utf8');
            child.stderr.on('data', function(chunk){
                //child.send({bitch: "my bitch"})
                console.log(chunk);
                //io.sockets.emit(eventName + 'Update', {update: chunk});
                //console.log("\n");
                //child.stdin.write('shalom lecha');
            });
            

            child.on('error', function(err){
                console.log("error:", err);
               /* io.sockets.emit('deploymentError', {error: err});*/
                callback(err);
            })

            child.on('exit', function(code){
                console.log("exiting: ", code);
                callback(null);
            })
        }
    }

    this.Amazon = function(){
        this.accept = function(visitor, project, callback){
            visitor.visitAmazon(this, project, callback);
        }
    }
};


module.exports = Deployment;
//util.inherits(Heroku, Deployment);
//util.inherits(Amazon, Deployment);