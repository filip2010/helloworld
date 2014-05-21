/**
 * deployment service for AWS
 * external events : CreationError | Creation | InstanceUpdatesStart | InstanceUpdates|  InstanceUpdatesError | InstanceUpdatesSuccess | DeploymentUpdatesStart | DeploymentUpdates | DeploymentError | DeploymentSuccess
 * internal events : SaveAwsData
 * @type {AWS|exports}
 */

var AWS = require('aws-sdk'),
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');

util.inherits(AwsDeploy, EventEmitter);

function AwsDeploy(accessKeyId, secretAccessKey, region, project, awsUserDataPath) {
    var self = this;

    AWS.config.update({accessKeyId: accessKeyId, secretAccessKey: secretAccessKey, region: region});
    this.opsworks = new AWS.OpsWorks({region: 'us-east-1'}); //only accesible through us region (doesn't have any meaning it is a global serivce)
    this.iam = new AWS.IAM({region: 'us-east-1'}); //only accesible through us region
    this.ec2 = new AWS.EC2({region: region});
    this.dataPath = awsUserDataPath;
    this.region = region;
    this.userData = {repository: project.repository, projectName: project.projectName};
    this.on('SaveAwsData', function(data){
        self.saveAwsUserData(function(err){
            if (err)
                console.log(err);
            else
                console.log("AWS project data has been saved:\n" + JSON.stringify(data));
        });
    });
    this.getAwsUserData(function(err, userData){
        if (err && err.errno != 34){
            self.emit('CreationError', err);
        }
        else{
            if (userData)
                self.userData = userData;
            self.emit('Creation')
        }
    });

}

// Public Functions

/**
 * responsible to make the intial deployment to amazon. creating on the way:
 * new instance profile, new role, attaching the role to the profile, new stack, new layer, new instance, new app and starting the instance
 * making sure to return only after the deployment has finished and the instance is online
 * @param callback
 */
AwsDeploy.prototype.initialDeployment = function(callback){
    var self = this;

    if (this.userData.Instances && this.userData.Instances.instanceId)
        return callback("An initial deployment has already been made. Try redploy.")

    self.createInstanceProfile(function(err){
        if (err)
            callback(err);
        else
            self.createRole(function(err){
                if (err)
                    callback(err);
                else
                    self.putRolePolicy(function(err){
                        if (err)
                            callback(err);
                        else
                            self.addRoleToInstanceProfile(function(err){
                                if (err && err.statusCode != 409)
                                    callback(err);
                                else
                                    setTimeout(function(err){ // To make the profile and role propagate in amazon servers before continuing
                                        self.createStack(function(err){
                                            if (err)
                                                callback(err);
                                            else
                                                self.createLayer(function(err){
                                                    if (err)
                                                        callback(err);
                                                    else
                                                        self.createInstance(function(err){
                                                            if (err)
                                                                callback(err);
                                                            else
                                                                self.createApp(function(err) {
                                                                    if (err)
                                                                        callback(err);
                                                                    else
                                                                        self.startInstance(function (err) {
                                                                            if (err)
                                                                                callback(err);
                                                                            else {
                                                                                callback(null, 'Initial deployment accepted.');
                                                                                self.updatesOnInstanceTillStatus('Initial Deployment', 'online');
                                                                            }
                                                                        })
                                                                })
                                                        })
                                                })
                                        })
                                    }, 5000)
                            })
                    })
            })
    })
}

/**
 * will handle all deployments action after initial deployment has been done before
 * in case the current instance status is: 'stopped' it will start the instance and deploy it
 * in case the current instance status is: 'online' it will create a deployment with the @param action
 * @param action - {'install_dependencies | update_dependencies | update_custom_cookbooks | execute_recipes | deploy | rollback | start | stop | restart | undeploy'}
 * @param callback
 */
AwsDeploy.prototype.deploy = function(action, callback){
    var self = this;

    if (!this.userData.Instances){
        console.log("starting initial deployment")
        return this.initialDeployment(callback);
    }
        //return callback("Can't redploy because initial deployment has not been made.")

    var deployParams = {
        Command: {
            Name: action
        },
        StackId: this.userData.Stacks.stackId,
        AppId: this.userData.Apps.appId,
        Comment: '',
        InstanceIds: [
            this.userData.Instances.instanceId
        ]
    };

    this.describeInstances(function(err, data){
        if (err)
            callback(err);
        else if (data.Instances[0].Status == 'stopped')
            self.startInstance(function(err, data){
                if (err)
                    callback(err);
                else {
                    callback(null, "Deploying your app accepted.")
                    self.updatesOnInstanceTillStatus('Restarting instance and deploying your app', 'online', function(err, ip){
                        if (err)
                            callback(err);
                        else
                            callback(null, ip);
                    })
                }
            });
        else if (data.Instances[0].Status != 'online' )
            callback("Can't redploy until the instance will be in status 'online' or 'stopped'. Current stats: " + data.Instances[0].Status);
        else if (data.Instances[0].Status == 'online')
            self.opsworks.createDeployment(deployParams, function(err, data) {
                if (err)
                    callback(err);
                else{
                    callback(null, action + "accepted.");
                    self.updatesOnDeployment(action, data.DeploymentId, function(err, data){
                        if (err)
                            callback(err);
                        else
                            callback(null, data);
                    });
                }
            });
    })
}

/**
 * responsible for returning information about the current instance that holds the application including a field PublicIp
 * which is the access point to the application
 * @param callback
 */
AwsDeploy.prototype.describeInstances = function(callback){

    if (!this.userData.Instances)
        return callback("Can't return information about instances before a deployment has been made");

    var params = {
        InstanceIds: [
            this.userData.Instances.instanceId
        ]
    };

    this.opsworks.describeInstances(params, function(err, data) {
        if (err)
            callback(err);
        else
            callback(null, data);
    });
}

/**
 * Sotpping the current instance that is in charge of holding the app.
 * It will just stop the instance but won't delete anything.
 * @param callback
 */
AwsDeploy.prototype.stopInstance = function(callback){
    var self = this;

    if (!this.userData.Instances)
        return callback("Can't stop the instance before a deployment has been made");

    var params = {
        InstanceId: this.userData.Instances.instanceId
    };

    this.describeInstances(function(err, data){
        if (err)
            callback(err);
        else if (data.Instances[0].Status != 'stopped' && data.Instances[0].Status != 'stopping')
            self.opsworks.stopInstance(params, function(err, data) {
                if (err)
                    callback(err);
                else{
                    callback(null, 'Stopping the instance accepted');
                    self.updatesOnInstanceTillStatus("Stopping instance", 'stopped', function(err, data){
                        if (err)
                            callback(err);
                        else
                            callback(null, data);
                    });
                }
            });
        else
            callback("Can't stop instance because its status is: " + data.Instances[0].Status);
    })
}

/**
 *  a function that will emit 'InstanceUpdates' event for a limited time until the instance reaches the required status
 *  when it reaches the requierd status it will apply callback
 * @param action : to be performed
 * @param requiredStatus : {'stopped' | 'stopping' | 'online'}
 * @param callback
 */
AwsDeploy.prototype.updatesOnInstanceTillStatus = function(action, requiredStatus){
    var self = this;
    var allowedTime = 1000 * 60 * 12; //in seconds
    var elpasedTime = 0;
    var interval = 5000;

    self.emit('InstanceUpdatesStart', 'Starting action: ' + action);

    var timer = setInterval(function(){
        if (elpasedTime > allowedTime){
            clearInterval(timer);
            return self.emit('InstanceUpdatesError', "The required action took to much time. Please try again.");
        }
        elpasedTime += interval;
        self.describeInstances(function(err, data){
            if (err){
                clearInterval(timer);
                self.emit('InstanceUpdatesError', err);
            }
            else if (data.Instances[0].Status != requiredStatus)
                self.emit('InstanceUpdates', "Current instance status: " + data.Instances[0].Status + ". Elpased Time: " + (elpasedTime/1000) + " seconds.");
            else{
                self.emit('InstanceUpdates', "Finished action: " + action + ". Elpased Time: " + elpasedTime/(1000*60) + " minutes." );
                clearInterval(timer);
                self.emit('InstanceUpdatesSuccess', {publicIp: data.Instances[0].PublicIp, totalTime: elpasedTime/(1000*60) });
            }
        })
    }, interval);
}

/**
 *  a function that will emit 'DeploymentUpdates' event for a limited time until the specific deployment action finishes
 *  if it passes the allowed time it will return an error
 * @param action : to be performed
 * @param callback
 */
AwsDeploy.prototype.updatesOnDeployment = function(action, deploymentId){
    var self = this;
    var allowedTime = 1000 * 60 * 2; //in seconds
    var elpasedTime = 0;
    var interval = 5000;

    self.emit('DeploymentUpdatesStart', 'Starting action: ' + action);

    var timer = setInterval(function(){
        if (elpasedTime > allowedTime){
            clearInterval(timer);
            return self.emit('DeploymentUpdatesError', "The required action took to much time. Please try again.");
        }
        elpasedTime += interval;
        self.describeDeployment(deploymentId, function(err, data){
            if (err){
                clearInterval(timer);
                self.emit('DeploymentUpdatesError', err);
            }
            else if (data.Deployments[0].Status != 'successful')
                self.emit('DeploymentUpdates', "Current status of the deployment: " + data.Deployments[0].Status + ". Elpased Time: " + (elpasedTime/1000) + " seconds.");
            else{
                self.emit('DeploymentUpdates', "Finished action: " + action + ". Elpased Time: " + elpasedTime/(1000*60) + " minutes." );
                clearInterval(timer);
                self.emit('DeploymentUpdatesSuccess', data);
            }
        });
    }, interval);
}



// Private Functions for now

AwsDeploy.prototype.createInstanceProfile = function(callback){
    var self = this;

    if (this.userData.InstanceProfile && this.userData.InstanceProfile.instanceProfileName)
        return callback();

    var profileParams = {
        InstanceProfileName: this.userData.projectName
    };

    this.iam.createInstanceProfile(profileParams, function(err, data) {
        if (err)
            callback(err);
        else {
            if (data) {
                self.userData.InstanceProfile = {};
                self.userData.InstanceProfile.instanceProfileName = data.InstanceProfile.InstanceProfileName;
                self.userData.InstanceProfile.arn = data.InstanceProfile.Arn;
                self.userData.InstanceProfile.instanceProfileId = data.InstanceProfile.InstanceProfileId;
            }
            //console.log(data);
            self.emit('SaveAwsData', data);
            callback()
        }
    });
}

AwsDeploy.prototype.createRole = function(callback){
    var self = this;

    if (this.userData.Role && this.userData.Role.roleName)
        return callback();

    var policy = {
        "Version": "2008-10-17",
        "Statement": [
            {
                "Sid": "",
                "Effect": "Allow",
                "Principal": {
                    "Service": [
                        "ec2.amazonaws.com",
                        "opsworks.amazonaws.com"
                    ]
                },
                "Action": "sts:AssumeRole"
            }
        ]
    };
    var roleParams = {
        AssumeRolePolicyDocument: JSON.stringify(policy),
        RoleName: this.userData.projectName
    };

    this.iam.createRole(roleParams, function(err, data) {
        if (err)
            callback(err);
        else {
            if (data) {
                self.userData.Role = {};
                self.userData.Role.roleName = data.Role.RoleName;
                self.userData.Role.arn = data.Role.Arn;
                self.userData.Role.roleId = data.Role.RoleId;
            }
            //console.log(data);
            self.emit('SaveAwsData', data);
            callback();
        }
    });
}

AwsDeploy.prototype.putRolePolicy = function(callback){
    var self = this;

    var policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "*",
                "Resource": "*"
            }
        ]
    };
    var policyParams = {
        PolicyName: 'CodefreshAllowAll',
        RoleName: this.userData.projectName,
        PolicyDocument: JSON.stringify(policy)
    };

    this.iam.putRolePolicy(policyParams, function(err, data) {
        if (err)
            callback(err);
        else {
            //console.log(data);
            self.emit('SaveAwsData', data);
            callback();
        }
    });
}

AwsDeploy.prototype.addRoleToInstanceProfile = function(callback){
    var self = this;

    var roleToInstanceParams = {
        InstanceProfileName: this.userData.projectName,
        RoleName: this.userData.projectName
    };

    this.iam.addRoleToInstanceProfile(roleToInstanceParams, function(err, data) {
        if (err)
            callback(err);
        else {
            //console.log(data);
            self.emit('SaveAwsData', data);
            callback();
        }
    });
}

AwsDeploy.prototype.createStack = function(callback){
    var self = this;

    if (this.userData.Stacks && this.userData.Stacks.stackId)
        return callback();

    this.describeVpcs(function(err, vpc){
        if (err)
            callback(err);
        else{
            var newStackParams = {
                ServiceRoleArn: self.userData.Role.arn,
                Name: self.userData.projectName,
                Region: self.region,
                DefaultInstanceProfileArn: self.userData.InstanceProfile.arn,
                UseOpsworksSecurityGroups: true,
                VpcId: vpc.VpcId
            };

            self.opsworks.createStack(newStackParams, function(err, data) {
                if (err)
                    callback(err);
                else {
                    self.userData.Stacks = {};
                    self.userData.Stacks.stackId = data.StackId;
                    //console.log(data);
                    self.emit('SaveAwsData', data);
                    callback();
                }
            });
        }
    })
}

AwsDeploy.prototype.createLayer = function(callback){
    var self = this;

    if (this.userData.Layers && this.userData.Layers.layerId)
        return callback();

    var layerParams = {
        Name: 'Codefresh Node.js App Server',
        Shortname: 'node.js_app',
        StackId: this.userData.Stacks.stackId,
        Type: 'nodejs-app',
        VolumeConfigurations: [
            {
                MountPoint: '/dev/sdh',
                NumberOfDisks: 1,
                Size: 5
            }
        ]
    };

    this.opsworks.createLayer(layerParams, function(err, data) {
        if (err)
            callback(err);
        else{
            self.userData.Layers = {};
            self.userData.Layers.layerId = data.LayerId;
            //console.log(data);
            self.emit('SaveAwsData', data);
            callback();
        }
    });
}

AwsDeploy.prototype.createInstance = function(callback){
    var self = this;

    if (this.userData.Instances && this.userData.Instances.instanceId)
        return callback();

    var instanceParams = {
        InstanceType: 't1.micro',
        LayerIds: [
            this.userData.Layers.layerId
        ],
        StackId: this.userData.Stacks.stackId,
        RootDeviceType: 'ebs'
    }

    this.opsworks.createInstance(instanceParams, function(err, data) {
        if (err)
            callback(err);
        else{
            self.userData.Instances = {};
            self.userData.Instances.instanceId = data.InstanceId;
            //console.log(data);
            self.emit('SaveAwsData', data);
            callback();
        }
    });
}

AwsDeploy.prototype.createApp = function(callback){
    var self = this;

    if (this.userData.Apps && this.userData.Apps.appId)
        return callback();

    var appParams = {
        Name: 'Demo app',
        StackId: this.userData.Stacks.stackId,
        Type: 'nodejs',
        AppSource: {
            Type: 'git',
            Url: this.userData.repository
        }
    }
    this.opsworks.createApp(appParams, function(err, data) {
        if (err)
            callback(err);
        else{
            self.userData.Apps = {};
            self.userData.Apps.appId = data.AppId;
            //console.log(data);
            self.emit('SaveAwsData', data);
            callback();
        }
    });
}

AwsDeploy.prototype.describeVpcs = function(callback){

    var params = {
        Filters: [
            {
                Name: 'isDefault',
                Values: [
                    'true'
                ]
            }
        ]
    };

    this.ec2.describeVpcs(params, function(err, data) {
        if (err)
            callback(err);
        else if (data.Vpcs.length < 1)
            callback("There is no default VPC that is defined in your specified region. please create one and retry.")
        else
            callback(null, data.Vpcs[0]);
    });
}

AwsDeploy.prototype.startInstance = function(callback){
    var self = this;

    var instanceParams = {
        InstanceId: this.userData.Instances.instanceId
    };

    this.describeInstances(function(err, data){
        if (err)
            callback(err);
        else if (data.Instances[0].Status != 'stopped')
            callback("Can't start instance because its status is: " + data.Instances[0].Status);
        else
            self.opsworks.startInstance(instanceParams, function(err, data) {
                if (err)
                    callback(err);
                else{
                    //console.log(data);
                    callback(null, "Starting the instance");
                }
            });
    })
}

AwsDeploy.prototype.describeApps = function(callback){
    var params = {
        StackId: this.userData.Stacks.stackId
    };

    this.opsworks.describeApps(params, function(err, data) {
        if (err)
            callback(err);
        else
            callback(null, data);
    });
}

AwsDeploy.prototype.describeDeployment = function(deploymentId, callback){

    var params = {
        DeploymentIds: [
            deploymentId
        ]
    };

    this.opsworks.describeDeployments(params, function(err, data) {
        if (err)
            callback(err);
        else
            callback(null, data);
    });

}

AwsDeploy.prototype.getAwsUserData = function(callback) {
    fs.readFile(this.dataPath, function (err, data) {
        if (err){
            callback(err);
        }
        else {
            var userData = JSON.parse(data);
            callback(null, userData);
        }
    });
}

AwsDeploy.prototype.saveAwsUserData = function(callback) {
    var self = this;
    fs.writeFile(self.dataPath, JSON.stringify(self.userData), function (err) {
        if (err)
            callback(err);
        else
            callback();
    });
}

module.exports = AwsDeploy;

