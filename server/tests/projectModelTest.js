var request =   require('assert')
    , should =  require('should')
    , Project =  require('../models/projectModel.js')
    , fs =      require('fs')
    , rimraf =  require('rimraf')
    , should = require('should')
    , path =  require('path')

  

describe('Project Creation test suite ', function(){


 try
 {
  describe('Project CRUD', function(){
    var projectSettings;
    var Utils = {
      generateName : function()
      {
         var date = new Date();
        var projectName = "E2EProjectTest_" + date.getMonth() + "_" + date.getDay()
        + "_" + date.getHours() + "_" + date.getMinutes() + "_" + date.getSeconds();

        return projectName;
      }
    }
    beforeEach(function(done){
         var templatePath = Project.privateUtils.templatePathBuilder(2);
         projectSettings.templatePath = templatePath;
          projectSettings.projectName = Utils.generateName();
          projectSettings.path = Project.privateUtils.pathBuilder(projectSettings.username,
          projectSettings.projectName);

          done();

    })
    before (function(done)
    {
      
         projectSettings = {
                                    projectName : "testProject" ,
                                    description: "node.js project" , 
                                    username : "itai" ,
                                    templateId : 1

                                }

                  Project.privateUtils.readTemplatesMeta();
                  var projectPath =  Project.privateUtils.pathBuilder(projectSettings.username, projectSettings.projectName);
                 // console.log(JSON.stringify(results));
                  projectSettings.path  = projectPath;
                  var actualPath = path.resolve(projectSettings.path);
                  var expected = path.resolve("./server/users/itai/projects/testProject");
                  actualPath.should.eql(expected);
                  done();

    });


    it('dummy tests', function(done){ 
        console.log("do someting during 2 sec");
        setTimeout(function(){
          console.log("2 sec passed")
          done();
        }, 300); 
    });
    it('project properties validation', function(done){
         
         console.log("test1");
         var settings = {
                            projectName : "testProject" ,
                            description: "node.js project" , 
                            username : "itai" ,
                            templateId : 1

                        }

         project = new Project(settings);
         project.should.have.property('projectName', 'testProject');
       //  project.should.have.property('creationDate');
         
         done();
    });
    it('test build project path method', function(done){
          console.log("test build project math");
        
          var actual =  Project.privateUtils.pathBuilder(projectSettings.username,
          projectSettings.projectName);
          
          var expected = "./server/users/itai/projects/testProject";
          path.resolve(actual).should.equal(path.resolve(expected));
         
         done();
    }); 
    it('test template controller internal function', function(done)
    {
             Project.privateUtils.readTemplatesMeta(function(actual)
             {
              done();
             })
    });
    it('test template path creation method', function(done){
          
        
            var actual = Project.privateUtils.templateIdtoName(2);
            var expected = {
              "id": 2,
              "name": "demo-template",
              "icon": "angular.js-node.js/icon.jpg",
              "files": "",
              "handler": "./handler.js"
            };
             actual.should.eql(expected.name);
             done();
        
         

         // var expected = "./server/templates/angular.js-node.js";
         // path.resolve(actual).should.equal(path.resolve(expected));
         
         //done();
    });
    it('test copy from template method', function(done){
          
         
          function callback(err){
            if (err){
              assert.fail(err , undefined, "the copy tempalate ended with error" );
              done ();
            }
            console.log("copy finished with wihout error ");;
            done();
          }
          Project.privateUtils.copyFromTemplate(projectSettings.templatePath, projectSettings.path , callback);
   
    });
    it('delete project', function(done){
        
          function callback(err){
            if (err){
              assert.fail(err , undefined, "delete ended with error" );
              done ();
            }
            console.log("delete finished with wihout error ");;
            done();
          }
         Project.privateUtils.deleteProject(projectSettings, callback);
   
    });
    it.only ('create project E2E', function(done){
                
        var date = new Date();
        projectSettings.projectName = Utils.generateName();

          function callback(project , err){
            if (err){
              assert.fail(err , undefined, "delete ended with error" );
              done ();
            }
            console.log("delete finished with wihout error ");;
            done();
          }
         Project.createProject(projectSettings, callback);
   
    });

})


}catch (e)
{
    console.log(e);
}
});

describe('deploy locally ', function(){
 
})
