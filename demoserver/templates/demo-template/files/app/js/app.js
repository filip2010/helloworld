'use strict';


var yourApp = angular.module('yourApp', ['ngRoute']);

yourApp.config(['$routeProvider',
  function($routeProvider) {
  $routeProvider.
      when('/homePage', {
        controller: 'HomeCtrl',
        templateUrl: '/views/partials/homePage.html'
      }).when('/demo', {
        controller: 'DemoCtrl',
        templateUrl: '/views/partials/demo.html' 
        
      }).
      otherwise( {redirectTo: '/homePage'});
}]);