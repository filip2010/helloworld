'use strict';

fresh.controller('ViewProjectsCtrl', ['$scope', '$state', 'data', 'Project', 'ProjectSocketIOEvents',
    function($scope, $state, data, Project, ProjectSocketIOEvents){

        var events = ProjectSocketIOEvents;
  var initProjects = function(projects) 
  {
        if (data.projects)
        {
           
             $scope.projects = data.projects;
        }
        else
            $scope.projects = [];
  }


  initProjects(data);

   $scope.$root.$on("refreshDashboard" ,function()
               {
                    console.log("refresh");
                    var data = Project.getAllProjects({username: 'itai'});
                    data.$promise.then(function(){
                            $scope.projects = data.projects;
                        }); 

               });

 $scope.deleteProject = function(project){
            var paramsData = {username: 'itai', projectName: project.projectName};
            Project.deleteProject(paramsData,
                function(res){
                    
                    alert('Project Deleted');
                    var projects = Project.getAllProjects();
                    projects.$promise.then(function()
                        {
                            initProjects(projects)
                        });

                },
                function(err){
                    alert(err.data);


            });
        }

        $scope.deployProject = function(project){
            alert("Starting your deployment. this can take several moments...")
            var promise = events.register('deployProject');
            promise.then(function(success){
                console.log(success);
            }, function(error){
                console.log(error);
            }, function(update){
                console.log(update);
            });
            var postData = {username: 'itai', projectName: project};
            Project.deployProject.save({}, postData,
                function(res){
                    alert('Project has been deployed succesfully');
                    var win = window.open('http://' + project + '.herokuapp.com', '_blank');
                    win.focus();                   
                },
                function(err){
                    alert("Error: " + err.data);
                    var win = window.open('http://' + project + '.herokuapp.com', '_blank');
                    win.focus();  
                });
        }

        $scope.fullScreen = function(project)
        {
         if (!project.fullScreen)
            project.fullScreen = false;
          project.fullScreen =  !project.fullScreen;
        }
        $scope.createNewProject = function(projectName){
           var project =  Project.createProject(projectName, 1);
           project.$promise.then(function()
            {
                $scope.projects.push(project.projectName);
            });
        }
            //$state.go("dashboard.viewProjects.wizard");}
        $scope.deploy = function()
        {
            Project.deployProject({projectName:"MyProject"});
        }
    }
]);