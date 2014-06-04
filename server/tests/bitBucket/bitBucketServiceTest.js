var request =   require('supertest')
    , should =  require('should')
    , bitBucket = require('../../services/bitBucket.js');



describe('get all issues tests', function(){

    it('1 should return all issues', function(done){
        var params = {username: 'lobengula3rd', password: 'q9zykvmY', repoName: 'Workshop'};
        bitBucket.getIssues(params, function(err, data){
            (err === null).should.be.true;
            (data === null).should.be.false;
            done();
        })

    });

});

describe('create a new repo', function(){
    var params = {username: 'lobengula3rd', password: 'q9zykvmY', repoName: 'HelloZona'};

    it('1 should create a new repo', function(done){
        bitBucket.createRepo(params, function(err, data){
            (err === null).should.be.true;
            (data === null).should.be.false;
            console.log(data);
            done();
        })
    });

    after(function(done){
        bitBucket.deleteRepo(params, function(err, data){
            done();
        })
    });

});





