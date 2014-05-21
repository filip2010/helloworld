var         AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');
var ec2 = new AWS.EC2();

var describeImage = function(params, callback){
    ec2.describeImages(params, callback);
}

var runInstances = function(params, callback){
    ec2.runInstances(params, callback);
}

var terminateInstances = function(params, callback){
    ec2.terminateInstances(params, callback);
}


exports.describeImage = describeImage;
exports.runInstances = runInstances;
exports.terminateInstances = terminateInstances;
