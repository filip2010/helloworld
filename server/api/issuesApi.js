var  issuesCtrl =             require('../controllers/issuesCtrl.js');
console.log("in issue ctrl");
module.exports = function (app, io) {


    var issues = new issuesCtrl(io);
    //issues 
     app.get('/issues/:projectName', issues.getIssues);
}