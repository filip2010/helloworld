var  ProjectCtrl =             require('../controllers/projectCtrl.js');
var _ = require("underscore");   


module.exports = function (app, io) {

    var projectCtrl = new ProjectCtrl(io);

    app.get('/projects/all', projectCtrl.getAllUserProjectsNames);

    app.get('/projects/:projectName', projectCtrl.openProject);
    app.get('/projects/:projectName/files', function(req, res)
        {
            req.params =_.extend(req.params || {}, req.query || {}, req.body || {});
            if (req.params.onlynames)
              projectCtrl.getProjectTree(req, res) ;
            else 
             projectCtrl.getProjectFiles(req, res) ;
     });
 
   
    app.put('/projects',function(req, res){
      console.log("in create project API");
      projectCtrl.createProject(req, res);
    });



    app.put('/projects/:projectName/files/:fileName', projectCtrl.createNewFile); //file by file 
    app.post('/projects/:projectName/files/:fileName', projectCtrl.updateFile);
   // app.post('/project/uploadFiles', projectCtrl.uploadFile); //file by file 


    app.post('/projects/:projectName/deploy/:provider', projectCtrl.deploy);
    app.get('/projects/:projectName/stopInstance', projectCtrl.stopInstance);
    app.get('/projects/:projectName/describeInstance', projectCtrl.describeInstances);



    app.delete('/projects/:projectName' , function(req, res)
    {
      req.params =_.extend(req.params || {}, req.query || {}, req.body || {});
      projectCtrl.deleteProject(req , res);
    })

}