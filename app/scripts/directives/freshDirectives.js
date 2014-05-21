                                
angular.module("fresh").directive('freshheader', function(Project) {
        return {
            restrict: 'AE',
            scope: true ,
            templateUrl: 'views/templates/header.html' ,
            controller: function($scope, $state){
                console.log("in header controller");
                $scope.navigateToHome = function()
                {
                    $state.go("start");
                }

               $scope.createProject = function()
               {
                $state.go("createProject");
               }

            },
            link: function(scope, element, attrs){
                console.log("freshHeader link function");
            },
        }
    });