
var  path =                require('path')
   , async =               require('async')
    , Project =             require('../models/projectModel.js')
    , ProjectsRepository =  require('../models/ProjectsRepository.js')
    , _                  =  require("underscore");
     


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

 
}

module.exports = issuesCtrl;