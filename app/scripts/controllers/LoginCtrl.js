'use strict';

angular.module("fresh").controller('LoginCtrl', ['$scope', '$state' ,
    function($scope, $state ){

   
 $scope.login = function(provider){
          $scope.$root.loggedUser = {name : "Oleg Verhovsky"};
          $state.go("start");
          return true;
           
        }

       
    }
]);