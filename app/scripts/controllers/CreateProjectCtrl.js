'use strict';

fresh.controller('CreateProjectCtrl', ['$scope', 'Project', '$state', 'templates', 'ProjectSocketIOEvents', '$timeout',
    function($scope, Project, $state, templates, ProjectSocketIOEvents, $timeout){

        var events = ProjectSocketIOEvents;

        $scope.project = {name: null, templateName: null};

        $scope.information = {text: "Show Information"};

        $scope.templates = templates;

        $scope.createProject = function(){
            Project.createProject($scope.projectName, 1);
        }
        /*
            if (!$scope.project.name || !$scope.project.templateName){
                alert("please fill all fields");
            }
            else{
                var promise = events.register('deployment');
                promise.then(function(success){
                    console.log(success);
                    $scope.message = success;         
                }, function(error){
                    console.log(error);
                    $scope.message = error;
                }, function(update){
                    console.log(update);
                    $scope.message = update;
                });

                var postData = {username: 'itai', projectName: $scope.project.name, templateName: $scope.project.templateName}
                Project.createProject.save({}, postData,
                    function(res){
                        alert('Project Created')
                        $state.go('dashboard.viewProjects');
                    },
                    function(err){
                        alert(err.data);
                    });
            }
        }*/

        $scope.message = "waiting for response from the server!";

        var num = 500;
        console.log("here");
        var promise = events.register('news');
        promise.then(function(success){
            $timeout(function(){
                console.log(success);
                $scope.message = success;}, num);           
        }, function(error){
            console.log(error);
            $scope.message = error;
        }, function(update){
            $timeout(function(){
                console.log(update);
                $scope.message = update;}, num); 
            num += 500;           
        });

    }
]);

/*fresh.controller('MyCtrl', ['$scope', 
    function($scope){

        $scope.phones = [1, 2, 3];

    }
]);*/



/*
        $scope.step = $state.current.data.step;
        $scope.$on('$stateChangeSuccess', function(){
            $scope.step = $state.current.data.step;
        })*/


/*        var templates = templateService.allMetadata.query({}, function(data){
            $scope.templates = templates;
        }, function(err){
            console.log(err);
        });*/