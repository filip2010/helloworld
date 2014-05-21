'use strict';

var fresh = angular.module('fresh');
var  DataProvider;
 
fresh.directive('userstoriesareachart', function($window, $timeout) {
  
 
     
 
  return {
            restrict: 'AE',
            templateUrl: 'views/templates/graphs.html',
            scope : {
              "graphtype" : '@'
            },
            controller : function($scope)
            {
              console.log("[controller]scope type = " + $scope.graphtype);
            },
            link: function($scope, element, attrs){
              

             $timeout(function(){
                         $(function () {
                $(element).highcharts({
                            chart: {
                                type: 'area'
                            },
                            title: {
                                text: 'Release Burndown'
                            },
                            subtitle: {
                                text: 'Source: Wikipedia.org'
                            },
                            xAxis: {
                                categories: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6', 'Release 1.0'],
                                tickmarkPlacement: 'on',
                                title: {
                                    enabled: false
                                }
                            },
                            yAxis: {
                              title: {
                                  text: 'User Stories Progress'
                              }
                            },
                          tooltip: {
                              pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f} millions)<br/>',
                              shared: true
                          },
                          plotOptions: {
                              area: {
                                  stacking: 'percent',
                                  lineColor: '#ffffff',
                                  lineWidth: 1,
                                  marker: {
                                      lineWidth: 1,
                                      lineColor: '#ffffff'
                                  }
                              }
                          },
                          series: [{
                              name: 'New',
                              data: [600, 475, 400, 334, 200, 120, 70]
                          }, {
                              name: 'In Progress',
                              data: [100, 80, 60, 70, 50, 45, 70]
                          }, {
                              name: 'In Testing',
                              data: [0, 40, 50, 70, 45, 44, 30]
                          },   
                             { name: 'Done',
                              data: [0, 42, 80, 120, 209, 280, 335]
                          }]
                    });
                                 
                        });
                  }, 0, true)
    

            }
    
    
}})//end graph directive


 

