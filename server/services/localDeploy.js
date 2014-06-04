/**
 * deployment service for AWS
 * external events : CreationError | Creation | InstanceUpdatesStart | InstanceUpdates|  InstanceUpdatesError | InstanceUpdatesSuccess | DeploymentUpdatesStart | DeploymentUpdates | DeploymentError | DeploymentSuccess
 * internal events : SaveAwsData
 * @type {AWS|exports}
 */

var fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    path = require('path')

util.inherits(LocalDeploy, EventEmitter);

function LocalDeploy() {
     
}


    
/**
 * will handle all deployments action after initial deployment has been done before
 * in case the current instance status is: 'stopped' it will start the instance and deploy it
 * in case the current instance status is: 'online' it will create a deployment with the @param action
 * @param action - {'install_dependencies | update_dependencies | update_custom_cookbooks | execute_recipes | deploy | rollback | start | stop | restart | undeploy'}
 * @param callback
 */
LocalDeploy.prototype.deploy = function(project ,  callback){
      
        var randomPort = Math.floor((Math.random()*4000)+3000);
        var execPath = project.path;
        var serverIp;
        var attemps = 0;

        if (!process.env.serverIp)
            serverIp = "54.72.92.150";
        else
            serverIp = process.env.serverIp;
        if (!project.projectName)
            return res.send(400);

        if (!process.env["environment"] || process.env["environment"] == "win" ){
          (function windowsDeploy(randomPort) {

                console.log("application will be deployed on port " + randomPort);

                var child = exec('node server.js ' + randomPort, {cwd:  execPath}, function(err, stdout, stderr){

                    if (err){
                        console.log("error:" + stderr + " occured");
                        randomPort = Math.floor((Math.random()*4000)+3000);
                        if (attemps > 5)
                            return res.send(400, 'failed to run your application' + stderr);
                        windowsDeploy(randomPort);
                        attemps++;

                    }
                    else{
                        console.log(stdout);
                        project.deployUrl = 'http://' + serverIp + ":" + randomPort;
                        return res.send(200,  project);
                    }

                });

                child.stdout.on('data', function (data) {
                    project.deployUrl = 'http://' + serverIp + ":" + randomPort;
                    return res.send(200,  project);
                });

            })(randomPort);
        }
        else if (process.env['environment'] == 'unix')
            exec('forever stop server.js', {cwd: path.resolve('server/users', project.username, 'projects', project.projectName)}, function(err, stdout, stderr){
                exec('forever start server.js ' + randomPort, {cwd: path.resolve('server/users', project.username, 'projects', project.projectName)},
                    function(err, stdout, stderr){
                        if (err){
                            console.log(err);
                            return res.send(400, 'failed to run your application');

                        }
                        else{
                            process.env.serverIp = "54.72.92.150";
                            return res.send(200, "http://54.72.92.150:" + randomPort);
                            console.log(stdout);
                        }
                    })
            })
    }



module.exports = new LocalDeploy();

