var  ProjectCtrl =             require('../controllers/projectCtrl.js');
    


module.exports = function (app, io) {

    var projectCtrl = new ProjectCtrl(io);

    app.get('/project/getProjectFiles/:username/:projectName', projectCtrl.getProjectFiles); //sends zip

    app.get('/project/getProjectFiles/:username/:projectName/*', projectCtrl.getProjectFiles);

    app.get('/project/allProjects/:username', projectCtrl.getAllUserProjectsNames);

    app.post('/project/createProject', function(req, res){
      //console.log("in create project API");
      projectCtrl.createProject(req, res);
    });

    app.delete('/project/deleteProject/:username/:projectName', projectCtrl.deleteProject);

    app.get('/project/getProjectTree/:username/:projectName', projectCtrl.getProjectTree);

    app.post('/project/updateFiles', projectCtrl.updateFiles); //file by file 

    app.post('/project/uploadFiles', projectCtrl.uploadFiles); //file by file 

    app.post('/project/deploy', projectCtrl.deploy);


}