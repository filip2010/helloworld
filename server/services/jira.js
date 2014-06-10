var request =   require('request'),
    exec =      require('child_process').exec;


var createHostUrl = function(accountName) {
    var testUrl = "https://792th5pxvvdc.runscope.net/?Runscope-Playback-Id=cf4d0e1b-fde6-40cb-8053-e537c3065802";
    //return testUrl;
    return 'https://codefresh.atlassian.net/rest/api/2/'
}

/**
 * returns all projects
 * @param params - Object with fields - {username, password, accountName}
 * @param callback
 * @returns {*}
 */
var getProjects = function(params, callback){
    if (!params.accountName)
        return callback("a jira account name has to be inserted", null);
    if (!params.username)
        return callback("a jira username has to be inserted", null);
    if (!params.password)
        return callback("a jira password has to be inserted", null);

    request.get(createHostUrl(params.accountName) + 'project', {
            'auth': {
                'user': params.username,
                'pass': params.password,
                'sendImmediately': false
            }
        }
        , function(err, resp, body){
            console.log(err);
            if (err)
                return callback(err, null);
            else if (resp.statusCode >= 400)
                return callback(resp, null);
            else
                return callback(null, JSON.parse(body));
        }
    );

    return request;
}

/**
 * @param params - Object with fields: {username, password, accountName, projectName, status}
 * status is not obligatory
 * @param callback
 */
var getIssues = function(params, callback){
    if (!params.accountName)
        return callback("a jira account name has to be inserted", null);
    if (!params.username)
        return callback("a jira username has to be inserted", null);
    if (!params.password)
        return callback("a jira password has to be inserted", null);
    if (!params.projectName)
        return callback("a project in jira must be inserted", null);


    var maxResults = 50;
    var fields = 'summary,status,issuetype';

    if (!params.status)
        var searchString = 'search?jql= project="' + params.projectName +'"&maxResults=' + maxResults + '&fields=' + fields;
    else
        var searchString = 'search?jql= project="' + params.projectName +'" and status="' + params.status + '"&maxResults=' + maxResults + '&fields=' + fields;



    request.get(createHostUrl(params.accountName) + searchString, {
            'auth': {
                'user': params.username,
                'pass': params.password,
                'sendImmediately': true
            }
        }
        , function(err, resp, body){
            //console.log(body);
            //console.log(resp);
            //console.log(err);
            if (err)
                return callback(err, null);
            else if (resp.statusCode >= 400)
                return callback(resp, null);
            else
                return callback(null, JSON.parse(body));
        }
    );
}

/**
 * returns metadata regarding information about how to create new issues
 * * @param params - Object with fields - {username, password, accountName}
 */
var getMetadata = function(params, callback){
    if (!params.accountName)
        return callback("a jira account name has to be inserted", null);
    if (!params.username)
        return callback("a jira username has to be inserted", null);
    if (!params.password)
        return callback("a jira password has to be inserted", null);

    request.get(createHostUrl(params.accountName) + 'issue/createmeta', {
            'auth': {
                'user': params.username,
                'pass': params.password,
                'sendImmediately': true
            }
        }
        , function(err, resp, body){
            //console.log(resp);
            //console.log(body);
            if (err)
                return callback(err, null);
            else if (resp.statusCode >= 400)
                return callback(resp, null);
            else
                return callback(null, JSON.parse(body));
        }
    );
}

/**
 * creates a new issue with the provided data
 * @param params - Object with fields - {accountName, username, password, projectName, issueTypeName, summary, description}
 * description is not obligatory
 * @param callback
 */
var createIssue = function(params, callback){
    if (!params.accountName)
        return callback("a jira account name has to be inserted", null);
    if (!params.username)
        return callback("a jira username has to be inserted", null);
    if (!params.password)
        return callback("a jira password has to be inserted", null);
    if (!params.projectName)
        return callback("a project in jira must be inserted", null);
    if (!params.issueTypeName)
        return callback("a issuetype name must be inserted", null);
    if (!params.summary)
        return callback("a summary of issue must be inserted", null);


    if (!params.description)
        params.description = "";


    getProjects(params, function(err, data){
        if (err)
            return callback(err);

        var projectId;
        for (var i = 0; i < data.length; i++) {
            if (data[i].name == params.projectName) {
                projectId = data[i].id;
                break;
            }
        }

        var postData = {
            fields: {
                project: {id: projectId},
                issuetype: {name: params.issueTypeName},
                summary: params.summary,
                description: params.description
            }
        };

        request.post(createHostUrl(params.accountName) + 'issue', {
                'auth': {
                    'user': params.username,
                    'pass': params.password,
                    'sendImmediately': true
                },
                json: postData
            }
            , function(err, resp, body){
                //console.log(resp);
                //console.log(body);
                if (err)
                    return callback(err, null);
                else if (resp.statusCode >= 400)
                    return callback(resp, null);
                else
                    return callback(null, body);
            }
        );

    })

}

/**
 * delete an issue with the provided data
 * @param params - Object with fields - {accountName, username, password, issueId}
 * @param callback
 */
var deleteIssue = function(params, callback){
    if (!params.accountName)
        return callback("a jira account name has to be inserted", null);
    if (!params.username)
        return callback("a jira username has to be inserted", null);
    if (!params.password)
        return callback("a jira password has to be inserted", null);
    if (!params.issueId)
        return callback("an issue id must be inserted", null);


    request.del(createHostUrl(params.accountName) + 'issue/' + params.issueId, {
            'auth': {
                'user': params.username,
                'pass': params.password,
                'sendImmediately': true
            }
        }
        , function(err, resp, body){
            //console.log(resp);
            //console.log(body);
            if (err)
                return callback(err, null);
            else if (resp.statusCode >= 400)
                return callback(resp, null);
            else
                return callback(null, body);
        }
    );

}


exports.getProjects = getProjects;
exports.getIssues = getIssues;
exports.createIssue = createIssue;
exports.getMetadata = getMetadata;
exports.deleteIssue = deleteIssue;






