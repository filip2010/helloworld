
var  path                   =   require('path')
    , async                 =   require('async')
    , Project               =   require('../models/projectModel.js')
    , ProjectsRepository    =   require('../models/ProjectsRepository.js')
    , _                     =   require("underscore")
    , jira                  =   require("../services/jira.js");



function issuesCtrl(app)
{
    this.getIssues = function(req, res)
    {
        req.params =_.extend(req.params || {}, req.query || {}, req.body || {});
        ProjectsRepository.getProjectIssues(req.params.projectName , function(issues)
        {
            res.json(issues);
        });
    }

    this.getJiraProjects = function(req, res){
        req.params =_.extend(req.params || {}, req.query || {}, req.body || {});
        var request = jira.getProjects(req.params, function(err, issues){
            if (err)
                return res.send(400, err.body);
            else
                return res.send(200, issues);
        })

        return request;
    }

    this.getJiraIssues = function(req, res){
        req.params =_.extend(req.params || {}, req.query || {}, req.body || {});
        jira.getIssues(req.params, function(err, issues){
            if (err)
                return res.send(400, err.body);
            else
                return res.send(200, issues);
        })
    }

    this.createJiraIssue = function(req, res){
        req.params =_.extend(req.params || {}, req.query || {}, req.body || {});
        jira.createIssue(req.params, function(err, issue){
            if (err)
                return res.send(400, err.body);
            else
                return res.json(issue);
        })
    }

    this.deleteJiraIssue = function(req, res){
        req.params =_.extend(req.params || {}, req.query || {}, req.body || {});
        jira.deleteIssue(req.params, function(err, data){
            if (err)
                return res.send(400, err.body);
            else
                return res.send(200, data);
        })
    }


}

module.exports = issuesCtrl;