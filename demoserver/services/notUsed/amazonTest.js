//var aws =  require('./amazonService.js');
var AWSDeploy = require('../awsDeploy.js');

var projectSettings = {repository: 'https://bitbucket.org/lobengula3rd/third-demo.git', projectName: 'NewProject1'};
var awsUserDataPath = './userdata.json'



//itai account
var awsDeploy = new AWSDeploy("AKIAIWZA7VO52VMQUDHA", "B1Y9LBnz0BfjcIi5zTavoO7pC/XAq6oyDwkqhutz", "eu-west-1", projectSettings, awsUserDataPath);

//talya account
//var awsDeploy = new AWSDeploy("AKIAIJPX7GQJULIXAQXA", "AoaOVbfo7NwH40WBmg0mNfwNsmXEOjq2UE824NEU", "eu-west-1", projectSettings, awsUserDataPath);

// initialDeployment | deploy(action) | describeInstances | stopInstance

awsDeploy.on('CreationError', function(err){
    console.log(err);
});


awsDeploy.on('Creation', function(){
    awsDeploy.stopInstance(function(err, data){
        if (err)
            console.log(err);
        else
            console.log(data);
    });
});

awsDeploy.on('InstanceUpdates', function(data) {
    console.log(data);
});

awsDeploy.on('DeploymentUpdates', function(data) {
    console.log(data);
});




/*awsDeploy.on('Creation', function() {
    awsDeploy.initialDeployment(function(err, data){
        if (err)
            console.log(err);
        else
            console.log(data);
        awsDeploy.saveAwsUserData(function(err){
            if (err)
                console.log(err);
            else
                console.log("finished");
        });
    });
});*/









/*aws.getAwsUserData('./notUsed/userdata.json', function(err, userData){
    if (!userData)
        userData = {svn: 'Git', deployment: 'Amazon', templateName: "myTemplate", projectName: "newProject10"};
    aws.initialDeployment(userData, function(err, userData) {
        if (err)
            console.log(err);
        aws.saveAwsUserData(userData, './notUsed/userdata.json', function(err){
            if (err)
                console.log(err);
            else
                console.log("finished");
        });
    });
});*/

/*aws.getAwsUserData('./notUsed/userdata.json', function(userData){
    aws.describeInstances(userData, function(description, err){
        if (err)
            console.log(err);
        else
            console.log(description);
    })
});*/

/*aws.getAwsUserData('./notUsed/userdata.json', function(userData){
    aws.stopInstance(userData, function(data, err){
        if (err)
            console.log(err);
        else
            console.log(data);
    })
});*/

/*aws.getAwsUserData('./notUsed/userdata.json', function(userData){
    aws.describeApps(userData, function(data, err){
        if (err)
            console.log(err);
        else
            console.log(data.Apps[0].AppSource);
    })
});*/

//aws.initialDeployment(null, null);
//aws.deleteProfile(null, null);


/*
var createInstanceParams = {
    ImageId: 'ami-7eab5b09',
    MaxCount: 1,
    MinCount: 1,
    InstanceType: 't1.micro',
    Monitoring: {Enabled: false}

}

var terminateParams = {
    InstanceIds: [ // required
        'STRING_VALUE',
        // ... more items ...
    ]
};*/
