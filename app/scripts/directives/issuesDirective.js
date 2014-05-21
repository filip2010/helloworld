'use strict';

var fresh = angular.module('fresh');
var  DataProvider;
 
fresh.directive('issueschart', function($window, $timeout) {
  
 
     
 
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
                  $(element).highcharts({
                  chart: {
                      plotBackgroundColor: null,
                      plotBorderWidth: null,
                      plotShadow: false
                  },
                title: {
                    text: 'Defects Status grouped by serverity'
                        },
                tooltip: {
                  pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'issues',
                    data: [
                        ['Low',   45 ],
                        ['Medium',       26 ],
                        {
                            name: 'High',
                            y:  20,
                            sliced: true,
                            selected: true
                        },
                        ['Critical',    9],
                    
                            ]
                        }]
            });//end .highchart
        }, 0, true);//end timeout
    

            }//end link
    
    
}})//end graph directive


 

      