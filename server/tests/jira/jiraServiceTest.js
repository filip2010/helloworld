var request =   require('supertest')
    , should =  require('should')
    , jira = require('../../services/jira.js');


var username = 'verchol';
var password = 'oleg1314';
var accountName = 'codefresh';
var projectName = 'ItaiTest';


describe('get all projects', function(){
    var params = {username: username, password: password, accountName: accountName};

    it('1 shouls return all projects of the logged in user', function(done){
        jira.getProjects(params, function(err, data){
            (err === null).should.be.true;
            (data === null).should.be.false;
            done();
        })
    });

});

describe('get all issues', function(){

    it('1 shouls return all issues that has a status TO DO of a project', function(done){
        var params = {username: username, password: password, accountName: accountName, projectName: 'CodeFresh Prototype', status: 'TO DO'};
        jira.getIssues(params, function(err, data){
            (err === null).should.be.true;
            (data === null).should.be.false;
            done();
        })
    });

    it('2 shouls return all issues that has a status DONE of a project', function(done){
        var params = {username: username, password: password, accountName: accountName, projectName: 'CodeFresh Prototype', status: 'DONE'};
        jira.getIssues(params, function(err, data){
            (err === null).should.be.true;
            (data === null).should.be.false;
            done();
        })
    });

    it('2 shouls return all issues that with all status of a project', function(done){
        var params = {username: username, password: password, accountName: accountName, projectName: 'CodeFresh Prototype'};
        jira.getIssues(params, function(err, data){
            (err === null).should.be.true;
            (data === null).should.be.false;
            done();
        })
    });

});

describe('get meta data about creating new issues', function(){

    it('1 should return the metadata', function(done){
        var params = {username: username, password: password, accountName: accountName};
        jira.getMetadata(params, function(err, data){
            (err === null).should.be.true;
            (data === null).should.be.false;
            //console.log(data.projects[0].issuetypes);
            done();
        })
    });


});

describe('create new issue', function(){

    var createdIds = [];

    it('1 should create a new issue', function(done){
        var params = {username: username, password: password, accountName: accountName, projectName: 'ItaiTest', issueTypeName: 'New Feature', summary: "summary", description: "description"};
        jira.createIssue(params, function(err, data){
            (err === null).should.be.true;
            (data === null).should.be.false;
            data.id.should.be.ok;
            createdIds.push(data.id);
            //console.log(data);
            done();
        })
    });

    it('2 should create a new issue even if description is not provided', function(done){
        var params = {username: username, password: password, accountName: accountName, projectName: 'ItaiTest', issueTypeName: 'New Feature', summary: "summary"};
        jira.createIssue(params, function(err, data){
            (err === null).should.be.true;
            (data === null).should.be.false;
            data.id.should.be.ok;
            createdIds.push(data.id);
            //console.log(data);
            done();
        })
    });

   /* after(function(done){
        var completedDeletions = 0;
        for (var i = 0; i < createdIds.length; i++){
            var params = {username: username, password: password, accountName: accountName, issueId: createdIds[i]};
            jira.deleteIssue(params, function(err, data){
                //console.log("deleted");
                completedDeletions++;
                if (completedDeletions == createdIds.length)
                    done();
            })
        }
    });*/


});



