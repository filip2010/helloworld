'use strict';

fresh.controller('IdeCtrl', ['$scope', '$state', 'projectTree', '$stateParams', 'Project',
    function($scope, $state, projectTree, $stateParams, Project){

        $scope.projectTree = projectTree

        $scope.getProjectFile = function(path){
            Project.projectFile.get({username: 'itai', projectName: $stateParams.projectName, filePath: path}, function(data){
                //do something with the incoming file
                console.log(data);
            }, function(err){
                console.log(err);
            });
        }

        //$scope.getProjectFile('server\\users\\itai\\projects\\my else project\\app\\views\\index.html')

    }
]);
