'use strict';


var yourApp = angular.module('yourApp', ['ngRoute']);

yourApp.config(['$routeProvider',
  function($routeProvider) {
  $routeProvider.
      when('/homePage', {
        controller: 'HomeCtrl',
        templateUrl: '/views/partials/homePage.html'
      }).
      otherwise( {redirectTo: '/homePage'});
}]);