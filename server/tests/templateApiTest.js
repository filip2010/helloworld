
var request =   require('supertest')
    , should =  require('should')
    , server =  require('../../server.js');


describe('Template Api Tests', function(){

  describe('1. GET all templates Metadata', function(){
    it('1.1 should respond with json', function(done){
      request(server.app)
        .get('/template/getAllTemplatesMetadata/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    it('1.2 should have id and name attributes', function(done){
      request(server.app)
        .get('/template/getAllTemplatesMetadata')
        .end(function(err, res){
          if (err) return done(err);
          res.body.length.should.be.above(1);
          for (var i=0; i<res.body.length; i++){
              res.body[i].id.should.be.equal(i+1);
              res.body[i].name.should.be.ok;
          }
          done()
        });
    })
  })

  describe('2. GET template Metadata by template name', function(){
    it('2.1 should respond with json', function(done){
      request(server.app)
        .get('/template/getTemplateMetadataByName/node.js')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    it('2.2 should have id and name attributes', function(done){
      request(server.app)
        .get('/template/getTemplateMetadataByName/node.js')
        .end(function(err, res){
          if (err) return done(err);
          res.body.id.should.be.ok;
          res.body.name.should.be.ok;        
          done();
        });
    })
  })

  describe('3. GET template Metadata by template id', function(){
    it('3.1 should respond with json', function(done){
      request(server.app)
        .get('/template/getTemplateMetadataById/1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    it('3.2 should have id and name attributes', function(done){
      request(server.app)
        .get('/template/getTemplateMetadataById/1')
        .end(function(err, res){
          if (err) return done(err);
          res.body.id.should.be.ok;
          res.body.name.should.be.ok;        
          done();
        });
    })
  })

  describe('4. GET template files by template ID', function(){
    it('4.1 should respond with a zip file containing all of the required template files', function(done){
      request(server.app)
        .get('/template/getTemplateFilesById/2')
        .set('Accept', 'application/zip')
        .expect('Content-Type', /zip/)
        .expect(200, done);
    });
    it('4.2 should respond with bad request syntax when trying to get an unexisting template id', function(done){
      request(server.app)
        .get('/template/getTemplateFilesById/100')
        .set('Accept', 'application/zip')
        .expect(400, done);
    });    
  })

  describe('5. GET template files by template name', function(){
    it('5.1 should respond with a zip file containing all of the required template files', function(done){
      request(server.app)
        .get('/template/getTemplateFilesByName/node.js')
        .set('Accept', 'application/zip')
        .expect('Content-Type', /zip/)
        .expect(200, done);
    });
    it('5.2 should respond with bad request syntax when trying to get an unexisting template name', function(done){
      request(server.app)
        .get('/template/getTemplateFilesByName/python')
        .set('Accept', 'application/zip')
        .expect(400, done);
    });
  })

});

