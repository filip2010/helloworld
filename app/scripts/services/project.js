'use strict';

fresh.service('Project', ['$http', '$resource',
    function($http, $resource){
        var project = $resource('/projects', {},
        	{
           all : {method:"GET", url: "/projects/all"},
        	 create : {method:"PUT"},
           deploy :  {
                method:"POST", 
                url : "/projects/:projectName/deploy" ,
                params : {projectName : "@projectName"}
              },
        	 getProject: {
        	 	method:"GET", 
                url : "/projects/:projectName",
                params : {projectName : "@projectName"} 
        	 },
             stopInstance: {
                 method:"GET",
                 url: "/projects/:projectName/stopInstance",
                 params : {projectName : "@projectName"}
             },
             describeInstance: {
                method:"GET",
                url: "/projects/:projectName/describeInstance",
                params : {projectName : "@projectName"}
             },
             getFiles : {
             	method:"GET", 
           	    url : "/projects/:projectName/files",
           	    params : {projectName : "@projectName" , onlynames : true}
           	},

             addNewFile : {
              method:"PUT", 
                url : "/projects/:projectName/files/:fileName" ,
                params : {projectName : "@projectName",fileName : "@fileName", fileContent: "@fileContent" }

              },

              updateFile : {
              method:"POST", 
                url : "/projects/:projectName/files/:fileName" ,
                params : {projectName : "@projectName",fileName : "@fileName"}

              },

              deleteProject : {
              method:"DELETE", 
                url : "/projects/:projectName" ,
                params : {projectName : "@projectName" }
              }
        });
        this.createProject = function(name , templateId)
        {
           if (!templateId)
           	templateId = 1;
           var proj = project.create({"username": "itai" , "projectName":name, "templateId":templateId});
           return proj;
        }  
        this.getProject = function(name)
        {
		   var proj = project.getProject({"username": "itai" , "projectName":name});
           return proj;
        }
        this.getAllProjects = function()
        {
        	return project.all();
        }
        this.deployProject = $resource('/project/deploy');

        this.allProjectNames = $resource('/project/allProjects/:username');

        this.deleteProject = function(params ,callback)
        {
          return project.deleteProject(params, callback);
        }

        this.projectTree = $resource('/project/getProjectTree/:username/:projectName');

        this.projectFile = $resource('/project/getProjectFiles/:username/:projectName/:filePath')
        /*missing API
           POST Deploy - project/id/deploy
           POST Create -  project/id/files/ 
           POST UpdateFile - project/id/files/fileId/


        */


        
    }
]);

