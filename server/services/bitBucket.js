var request =   require('request'),
    exec =      require('child_process').exec;

var host1 = 'https://bitbucket.org/api/1.0/';
var host2 = 'https://bitbucket.org/api/2.0/';



//example of use



var createRepo = function(params, callback){
    if (!params.username)
        return callback("a bitbucket username has to be inserted", null);
    if (!params.password)
        return callback("a bitbucket password has to be inserted", null);
    if (!params.repoName)
        return callback("a name for your git repository has to be inserted", null);

    // current bit bucket 2.0 api doesn't support CAPITAL letters
    params.repoName = params.repoName.toLowerCase();

    request.post(host2 + 'repositories/' + params.username + '/' + params.repoName, {
            'auth': {
                'user': params.username,
                'pass': params.password,
                'sendImmediately': true
            },
            form:{name: params.repoName, is_private: true, has_wiki: true, has_issues: true}
        }
        , function(err, resp, body){
            if (err)
                return callback(err, null);
            else if (resp.statusCode >= 400)
                return callback({status: resp.statusCode, reason: body}, null);
            else{
                return callback(null, {
                    clone: 'https://' + params.username + '@bitbucket.org/' + params.username + '/' + params.repoName + '.git',
                    html: 'https://bitbucket.org/' + params.username + '/' + params.repoName,
                    repoPath: params.username + '/' + params.repoName + '.git',
                    repoName: params.repoName
                    }
                );
            }
        }
    );
}

var deleteRepo = function(params, callback){
    if (!params.username)
        return callback("a bitbucket username has to be inserted", null);
    if (!params.password)
        return callback("a bitbucket password has to be inserted", null);
    if (!params.repoName)
        return callback("a name for your git repository has to be inserted", null);

    request.del(host2 + 'repositories/' + params.username + '/' + params.repoName, {
            'auth': {
                'user': params.username,
                'pass': params.password,
                'sendImmediately': true
            }
        }
        , function(err, resp, body){
            if (err)
                return callback(err, null);
            else if (resp.statusCode >= 400)
                return callback(resp, null);
            else{
                return callback(null, "Repository deleted");
            }
        }
    );
}

var getIssues = function(params, callback){
    if (!params.username)
        return callback("a bitbucket username has to be inserted", null);
    if (!params.password)
        return callback("a bitbucket password has to be inserted", null);
    if (!params.repoName)
        return callback("a name for your git repository has to be inserted", null);

    request.get(host1 + 'repositories/' + params.username + '/' + params.repoName + '/issues', {
            'auth': {
                'user': params.username,
                'pass': params.password,
                'sendImmediately': true
            }
        }
        , function(err, resp, body){
            if (err)
                return callback(err, null);
            else if (resp.statusCode >= 400)
                return callback(resp, null);
            else{
                return callback(null, body);
            }
        }
    );
}

var push = function(params, callback){
    if (!params.username)
        return callback("a bitbucket username has to be inserted", null);
    if (!params.password)
        return callback("a bitbucket password has to be inserted", null);
    if (!params.repoPath)
        return callback("a repository address has to be inserted in the format: {usernameCreatedRepo}/{repoName}", null);
    if (!params.path)
        return callback("a path to the directory which you wish to push has to be inserted", null);
    if (!params.message)
        return callback("a message to the commit must be inserted", null);

    var child = exec('git init', {cwd: params.path}, function(err, stdout, stderr){
        if (err)
            callback(err);
        else
            child = exec('git add -A', {cwd: params.path}, function(err, stdout, stderr){
                if (err)
                    callback(err);
                else
                    child = exec('git commit -m ' + '"' + params.message + '"', {cwd: params.path}, function(err, stdout, stderr){
                        /*if (err){
                            callback(stdout);
                        }
                        else{*/
                            var address = 'https://' + params.username + ':' + params.password + '@bitbucket.org/' + params.repoPath;
                            child = exec('git remote add origin ' + address, {cwd: params.path}, function(err, stdout, stderr){
                                /*if (err)
                                    callback(err);
                                else*/
                                    child = exec('git push origin master', {cwd: params.path}, function(err, stdout, stderr){
                                        if (err)
                                            callback(err);
                                        else
                                            return callback(null, stderr); //for some reason the info is in stderr. weird
                                    });
                            });
                        //}
                    });
            });
    });
}


/*var options = {username: 'itaigen', password: "pass", repoName: "new"};

//repoPath is returned as a field when creating a new repo
var pushParams = {username: 'itaigen', password: 'pass', repoPath: 'itaigen/new.git', message: "initial commit", path: '../../../node.js'};
deleteRepo(options, function(err, res){
    if (err){
        if (err.body)
            console.log(err.body);
        else
            console.log(err);
    }
    else
        console.log(res);
});

push(pushParams, function(err, res){
    if (err){
        if (err.body)
            console.log(err.body);
        else
            console.log(err);
    }
    else
        console.log(res);
});*/


exports.createRepo = createRepo;
exports.deleteRepo = deleteRepo;
exports.getIssues = getIssues;
exports.push = push;




