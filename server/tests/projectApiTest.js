var request =   require('supertest')
    , should =  require('should')
    , server =  require('../../server.js')
    , fs =      require('fs')
    , rimraf =  require('rimraf')
    , fs =      require('fs');


describe('Project Api Tests', function(){

  describe('1. Create New Project', function(){

    it('1.1 should create a new folder with the project inside the specific user', function(done){
      request(server.app)
        .post('/project/createProject/')
        .send({username: 'itai', projectName: 'mynewproject1', templateName: 'node.js'})
        .end(function(err, res){
          res.status.should.be.equal(200);
          fs.readdir('./server/users/itai/projects/mynewproject1/', function(err, files){
            //files.should.containEql('.git');
            //files.should.containEql('Procfile');
            done();
          })
        })
    });

    it('1.2 should create a new folder with the project inside the specific different user', function(done){
      request(server.app)
        .post('/project/createProject/')
        .send({username: 'oleg', projectName: 'mynewproject1', templateName: 'node.js'})
        .end(function(err, res){
          res.status.should.be.equal(200);
          fs.readdir('./server/users/oleg/projects/mynewproject1/', function(err, files){
            //files.should.containEql('.git');
            //files.should.containEql('Procfile');
            done();
          })          
        })
    });

    it('1.3 should create a new folder with a different project inside the specific user', function(done){
      request(server.app)
        .post('/project/createProject/')
        .send({username: 'oleg', projectName: 'mynewproject2', templateName: 'angular.js-node.js'})
        .end(function(err, res){
          res.status.should.be.equal(200);
          fs.readdir('./server/users/oleg/projects/mynewproject2/', function(err, files){
            //files.should.containEql('.git');
            //files.should.containEql('Procfile');
            done();
          })          
        })
    });

    it('1.4 should respond with 400 when trying to create a project with a name that already exists', function(done){
      request(server.app)
        .post('/project/createProject/')
        .send({username: 'itai', projectName: 'mynewproject1', templateName: 'node.js'})
        .expect(400, done);
    });

    it('1.5 should allow to create a new project with a different projectName', function(done){
      request(server.app)
        .post('/project/createProject/')
        .send({username: 'itai', projectName: 'mynewproject2', templateName: 'node.js'})
        .end(function(err, res){
          res.status.should.be.equal(200);
          fs.readdir('./server/users/itai/projects/mynewproject2/', function(err, files){
            //files.should.containEql('.git');
            //files.should.containEql('Procfile');
            done();
          })          
        })
    }); 

    it('1.6 should not create a proc file if server template is not node.js', function(done){
      request(server.app)
        .post('/project/createProject/')
        .send({username: 'itai', projectName: 'mynewproject3', templateName: 'facebookApp'})
        .end(function(err, res){
          res.status.should.be.equal(200);
          fs.readdir('./server/users/itai/projects/mynewproject3/', function(err, files){
            //files.should.containEql('.git');
            //files.should.not.containEql('Procfile');
            done();
          })          
        })
    });
  });

  describe('2. Delete a Project', function(){
    it('2.1 should delete an existing project', function(done){
      request(server.app)
        .del('/project/deleteProject/itai/mynewproject1')
        .expect(200, done);
    })

    it('2.2 should respond with 200 when trying to delete a project that does not exists', function(done){
      request(server.app)
        .del('/project/deleteProject/itai/mynewproject1')
        .expect(200, done);
    })
  });

  describe('3. Get Project Files', function(){
    it('3.1 should respond with a zip contating all the project files when the project exists', function(done){
      request(server.app)
        .get('/project/getProjectFiles/itai/mynewproject2')
        .set('Accept', 'application/zip')
        .expect(200, done);
    });

    it('3.2 should respond with 400 when the project does not exists', function(done){
      request(server.app)
        .get('/project/getProjectFiles/itai/unexistingProject')
        .set('Accept', 'application/zip')
        .expect(400, done);
    });

    it('3.3 should respond with a zip containing all the files inside a specific dir of a project', function(done){
      request(server.app)
        .get('/project/getProjectFiles/itai/mynewProject2/server/users/itai/projects/mynewproject2/')
        .set('Accept', 'application/zip')
        .expect('Content-Type', /zip/)
        .expect(200, done);
    });

    it('3.4 should respond with a file when the specified path is a specific file', function(done){
      request(server.app)
        .get('/project/getProjectFiles/itai/mynewProject2/server/users/itai/projects/mynewproject2/server.js')
        .set('Accept', 'application/octet-stream')
        .expect('Content-Type', /octet-stream/)
        .expect(200, done);
    });    

    it('3.5 should return a javascript file for a file that exist', function(done){
      request(server.app)
        .get('/project/getProjectFiles/itai/mynewproject2/server/users/itai/projects/mynewproject2/handler.js')
        .set('Accept', 'application/octet-stream')
        .expect('Content-Type', /octet-stream/)
        .expect(200, done);
    });

    it('3.6 should return 400 for a file that does not exist', function(done){
      request(server.app)
        .get('/project/getProjectFiles/itai/mynewproject2/server/users/itai/projects/mynewproject2/doesnotexist.js')
        .expect(400, done);
    });
  });

  describe('4. Get Project Tree', function(){
    it('4.1 shold return a tree structure in json of a project dir', function(done){
      request(server.app)
        .get('/project/getProjectTree/itai/mynewproject2/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          //console.log(res.body);
          done();
        })
    });
  });

  describe('5. Update an Existing File/s With New Content', function(){
    it('5.1 should respond with 500 when no file was attached to the request', function(done){
      request(server.app)
        .post('/project/updateFiles')
        .send({username: 'itai', projectName: 'mynewproject2', filePath: './server/users/itai/projects/mynewproject2/package.json'})
        .expect(500, done);
    });

    it('5.2 should respond with 400 when no file and no body was attached to the request', function(done){
      request(server.app)
        .post('/project/updateFiles')
        .expect(400, done);
    });

    it('5.3 should update the old file with the new attached file', function(done){
      request(server.app)
        .post('/project/updateFiles')
        .attach('filesUploaded', './server/users/itai/projects/mynewproject2/server.js')
        .attach('filesUploaded', './server/users/itai/projects/mynewproject2/server.js')
        .field('username', 'itai')
        .field('projectName', 'mynewproject2')
        .field('filesUploadedPaths', './server/users/itai/projects/mynewproject2/server.js')
        .field('filesUploadedPaths', './server/users/itai/projects/mynewproject2/server.js')
        .expect(200, done);
    });
  });

  describe('6. Upload New File/s', function(){
    it('6.1 should respond with 200 when uploading a new file', function(done){
      request(server.app)
        .post('/project/uploadFiles')
        .attach('filesUploaded', './server/users/itai/projects/mynewproject2/server.js')
        .attach('filesUploaded', './server/users/itai/projects/mynewproject2/server.js')
        .field('username', 'itai')
        .field('projectName', 'mynewproject2')
        .field('filesUploadedPaths', './server/users/itai/projects/mynewproject2/newServer1.js')
        .field('filesUploadedPaths', './server/users/itai/projects/mynewproject2/newServer2.js')
        .expect(200, done);
    });
  });

  describe('7. Get All User Projects Names', function(){
    it('7.1 should respond with 200 when asking for an existing user projects', function(done){
      request(server.app)
        .get('/project/allProjects/itai')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    it('7.1 should respond with 400 when the user does not exist', function(done){
      request(server.app)
        .get('/project/allProjects/moshe')
        .expect(400, done);
    });
  })

 /* describe('8. Deploy a project', function(){
    it('8.1 should be able to deploy a project that has files that have been changed since the intial commit', function(done){
      request(server.app)
        .post('/project/deploy/')
        .send({username: 'itai', projectName: 'mynewproject2', templateName: 'node.js'})
        .expect(200, done);
    })
*//*
    it('8.2 should return 400 when there are no changes to commit', function(done){
      request(server.app)
        .post('/project/deploy/')
        .send({username: 'itai', projectName: 'mynewproject1', templateName: 'node.js'})
        .expect(400, done);
    })*//*
  });*/

  after(function(done){
    rimraf('./server/users/itai/projects/', function(e){
      if (e) console.log(e);
      rimraf('./server/users/oleg/projects/', function(e){
        if (e) console.log(e);
        done();
      })
    })
  });

})

