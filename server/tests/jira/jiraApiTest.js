var request =   require('supertest')
    , should =  require('should')
    , server =  require('../../../demoserver.js')
    , fs =      require('fs')
    , rimraf =  require('rimraf');


describe('Get all projects', function(){

    it('1 should respond with 200 and return a list of projects', function(done){
        request(server.app)
            .get('/issues/jira/projects/codefresh/verchol/oleg1314')
            .end(function(err, res){
                res.status.should.be.equal(200);
                if (err)
                    return done();
                console.log(res.body);
                done();
            })
    });

})

describe('Get all issues', function(){

    it('1 should respond with 200 and return a list of issues', function(done){
        request(server.app)
            .get('/issues/jira/codefresh/verchol/oleg1314/ItaiTest')
            .end(function(err, res){
                res.status.should.be.equal(200);
                if (err)
                    return done();
                //console.log(res.body);
                done();
            })
    });

})

describe('Create new issue', function(){

    var issueId;

    it('1 should create a new issue', function(done){
        request(server.app)
            .post('/issues/jira/codefresh/verchol/oleg1314/ItaiTest')
            .send({issueTypeName: 'New Feature', summary: 'new task', description: 'description'})
            .end(function(err, res){
                res.status.should.be.equal(200);
                if (err)
                    return done();
                //console.log(res.body);
                issueId = res.body.id;
                done();
            })
    });

    after(function(done){
        request(server.app)
            .del('/issues/jira/codefresh/verchol/oleg1314/' + issueId)
            .end(function(err, res){
                res.status.should.be.equal(200);
                if (err)
                    return done();
                //console.log(res.body);
                done();
            })
    })

})


