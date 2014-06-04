angular.module("fresh").directive('project', function($state, Project) {
        return {
            restrict: 'AE',
            scope: {project: "="} ,
            templateUrl: 'views/templates/projectTmpl.html',
            controller : function($scope, $location)
            {
                $scope.ideUrl = $location.protocol() + "://" + $location.host() + ":8081" + "/edit/edit.html"
                $scope.projectTmpl = 'views/templates/project.html';

                var initProjects = function(data) 
                {
                      if (data.projects)
                      {
                         
                           $scope.projects = data.projects;
                      }
                      else
                          $scope.projects = [];
                }

               $scope.extend = function()
               {
                if ($scope.project.mode)
                   $scope.project.mode = undefined; 
                else
                 $scope.project.mode = "extendedProject";

               $scope.projectTmpl = 'views/templates/extendedProject.html';
               }
               $scope.$watch("project.mode" , function(newVal, old)
                {
                  
                  console.log("project Mode was extended");
                  
                });

              $scope.deleteProject = function(project){

                var paramsData = {username: 'itai', projectName: project.projectName};
                Project.deleteProject(paramsData,
                    function(res){
                        
                        alert('Project Deleted');
                        var projects = Project.getAllProjects();
                        projects.$promise.then(function()
                            {
                                initProjects(projects);
                                $scope.$root.$broadcast("refreshDashboard");
                            });

                    },
                    function(err){
                        alert(err.data);


                });
          }


            },
            link: function(scope, element, attrs){

            },
        }
    });