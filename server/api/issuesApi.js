var  issuesCtrl =             require('../controllers/issuesCtrl.js');
console.log("in issue ctrl");
module.exports = function (app, io) {


    var issues = new issuesCtrl(io);
    //issues 
    app.get('/issues/:projectName', issues.getIssues);
    app.get('/issues/jira/projects/:accountName/:username/:password', issues.getJiraProjects);
    app.get('/issues/jira/:accountName/:username/:password/:projectName', issues.getJiraIssues);
    app.post('/issues/jira/:accountName/:username/:password/:projectName', issues.createJiraIssue);
    app.del('/issues/jira/:accountName/:username/:password/:issueId', issues.deleteJiraIssue);

}