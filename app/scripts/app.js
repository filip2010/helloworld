'use strict';

var fresh = angular.module('fresh', [
    'ngCookies',
    'ngResource',
    'ui.router',
    'webideApp',
    'creationWizard',
     'btford.socket-io',
     'sandbox'
])

fresh.controller("rootController", function($scope, $state)
{
   $scope.createProject = function()
   {
    $state.go("createNewProject");
   }
});
fresh.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/login");

  //
  // Now set up the states
    $stateProvider
    .state('login', {
        url: "/login",
        templateUrl: "views/loginDialog.html",
        controller: 'LoginCtrl'
    }) 
    .state('start', {
        url: "/start",
        templateUrl: "views/projectDashboard.html",
         resolve: { 
              data : function(Project) {
                var data = Project.getAllProjects({username: 'itai'});
                data.$promise.then(function(){
                   console.log("data arrived "  + data);
                }); 
                return data.$promise;
              }
               
            },
            controller: 'ViewProjectsCtrl'
    }) 
    .state('dashboard', {
        url: "/dashboard",
        abstract: true,
        templateUrl: "views/dashboard.html",
        controller: 'DashboardCtrl'
    }) 

      //
      //  Create Project 
        .state('dashboard.createProject', {
            url: "/createProject",
            templateUrl: "views/dashboard.createProject.html",
            data: {step: "settings"},
            resolve: { 
                templates : function(Template){
                    return Template.allMetadata.query({}, function(data){
                    //console.log("here");
                    }, function(err){
                    console.log(err);
                    });
                }
            },
            controller: 'CreateProjectCtrl'
        }) 
            //
            //  Defining the new project 
            .state('dashboard.createProject.settings', {
              url: "/settings",
              templateUrl: "views/dashboard.createProject.settings.html",
            }) 
            .state('dashboard.viewProjects.wizard', {
              url: "/a",
              templateUrl: "views/dashboard.wizard.html",
              controller: "mainWizardCtrl"
            }) .state('graphs', {
              url: "/g",
              templateUrl: "views/charts-test.html",
              controller : function ($scope)
              {
                $(function()
                {
                          /* Inline sparklines take their values from the contents of the tag */
                      $('.inlinesparkline').sparkline(); 
 
                     
                      var myvalues = [10,8,5,7,4,4,1];
                      $('.dynamicsparkline').sparkline(myvalues);

                       
                      $('.dynamicbar').sparkline(myvalues, {type: 'bar', barColor: 'green'} );

                      
                      $('.inlinebar').sparkline('html', {type: 'bar', barColor: 'red'} ); 
             });  

               var line =  [1,2,3];
               var pie = [4,5,6];
               var graphs = $scope.graphs;  
               line.forEach (function(g){ 
                        console.log("chart" +  g.toString());
                         var g  =  new Morris.Line({
                                // ID of the element in which to draw the chart.
                                element: "chart" +  g.toString(),
                                // Chart data records -- each entry in this array corresponds to a point on
                                // the chart.
                                data: [
                                  { year: '2008', value: 20 },
                                  { year: '2009', value: 10 },
                                  { year: '2010', value: 5 },
                                  { year: '2011', value: 5 },
                                  { year: '2012', value: 20 }
                                ],
                                // The name of the data record attribute that contains x-values.
                                xkey: 'year',
                                // A list of names of data record attributes that contain y-values.
                                ykeys: ['value'],
                                // Labels for the ykeys -- will be displayed when you hover over the
                                // chart.
                                labels: ['Value']
                              });
                    });   

                  pie.forEach (function(g){ 
                        console.log("chart" +  g.toString());

                         var g  =   Morris.Bar({
                                      element: "chart" +  g.toString(),
                                      data: [
                                        { y: '2006', a: 100, b: 90 },
                                        { y: '2007', a: 75,  b: 65 },
                                        { y: '2008', a: 50,  b: 40 },
                                        { y: '2009', a: 75,  b: 65 },
                                        { y: '2010', a: 50,  b: 40 },
                                        { y: '2011', a: 75,  b: 65 },
                                        { y: '2012', a: 100, b: 90 }
                                      ],
                                      xkey: 'y',
                                      ykeys: ['a', 'b'],
                                      labels: ['Series A', 'Series B']
                                    });
                    }); 


             } 
              

              //controller: "mainWizardCtrl"
            })  
          .state('sandbox', {
              url: "/sandbox",
              templateUrl: "views/sandbox.html",
              controller: "sendBoxMainCtrl"
            })
            .state('dashboard.createProject.template', {
              url: "/template",
              templateUrl: "views/dashboard.createProject.template.html",
            })
            .state('dashboard.createProject.repository', {
              url: "/repository",
              templateUrl: "views/dashboard.createProject.repository.html",
            }) 
            .state('dashboard.createProject.deployment', {
              url: "/deployment",
              templateUrl: "views/dashboard.createProject.deployment.html",
            }) 
            .state('dashboard.createProject.logging', {
              url: "/logging",
              templateUrl: "views/dashboard.createProject.logging.html",
            }).state("createProject", { 
                                   url: "/createNewProject",
                                   template : '<div class="row" ui-view>aaaa</div>',
                                   controller: function($scope, $state, Project, ProjectSocketIOEvents, $timeout)
                                   {
                                         var events = ProjectSocketIOEvents;
                                         $scope.project = {};
                                         $scope.$on("OnWizardClosed", function(event , args)
                                         {
                                                alert("we are about to create project");
                                                if (!args.projectName || !args.template){
                                                                alert("missing data to create a project");
                                                            }
                                                            else{
                                                                var promise = events.register('createProject');
                                                                promise.then(function(success){
                                                                    console.log(success);
                                                                }, function(error){
                                                                    console.log(error);
                                                                }, function(update){
                                                                    console.log(update);
                                                                });
                                                                var postData = {username: 'itai', projectName: args.projectName,templateId: args.templateId, emplateName: args.template}
                                                                Project.createProject.save({}, postData,
                                                                    function(res){
                                                                        alert('Project Created')
                                                                        $state.go('dashboard.viewProjects');
                                                                    },
                                                                    function(err){
                                                                        alert("Error: " + err.data);
                                                                    });
                                                  }



                                              
                                         });  
                                     $state.go("createProject.showWizard");
                                   }})

            .state("createProject.showWizard" ,
            {
              url : "/createProject/showWizard",
              templateUrl: "views/testWizard.html",
              controller : "mainWizardCtrl"

              /* function($scope, $timeout, $templateCache, $compile)
              {
                var activeScreen = {}
                $scope.steps = [{title:"faaaa"}, {title:"gaaaa"},{title:"aaaaaaf"},{title:"faaa"}];
                function Screen (name, url)
                {
                  this.name = name;
                  if (url)
                  {
                    this.url = url
                  }else 
                    this.url = name + ".html";

                  this.isLoaded = false;


                }
                $scope.screens = [new Screen("general") ,new Screen("tech"), new Screen("repo"), new Screen("deployment")];
                       $scope.context = {};

                       $scope.dummy = function(){}
                       $scope.dummy.type = "function";
                       $scope.update = function(t)
                       {
                          
                          t.selected = "selected";
                          $scope.context[activeScreen].screen.handler()
                         // t.context[$scope.screens[$scope.currentIndex]] = t.title ;
                       }
                       $scope.templates = [{title:"Angular",icon:"img/icon-angular.png"},  {title:"Backbone", icon:"img/icon-backbonejs.png"},  {title:"NodeJS", icon: "img/icon-node.png"} 
                       , {title:"Facebook", icon:"img/icon-facebook.png"}];
                       $scope.repo  = [{title:"BitBucket",icon:"img/icon-bitbucket.png"},  {title:"GitHub", icon:"img/icon-github.png"}];
                       $scope.env =   [{title:"Amazon",icon:"img/icon-amazon.png"},  {title:"Heroku", icon:"img/icon-heroku.png"},  {title:"CloudBees", icon: "img/icon-cloudbees.png"}];

                                         

                $scope.$on('$viewContentLoaded', 
 
                 function(){

                      

                        var settings = {
                            
                            headerTag: "h1",
                            bodyTag: "section",
                            contentContainerTag: "section",
                            actionContainerTag: "section",
                            stepsContainerTag: "section",
                            cssClass: "wizard",
                            stepsOrientation: $.fn.steps.stepsOrientation.horizontal,

                             
                            titleTemplate: '<span class="number">#index#.</span> #title#',
                            loadingTemplate: '<span class="spinner"></span> #text#',

                            
                            autoFocus: false,
                            enableAllSteps: false,
                            enableKeyNavigation: true,
                            enablePagination: true,
                            suppressPaginationOnFocus: true,
                            enableContentCache: true,
                            enableFinishButton: true,
                            preloadContent: false,
                            showFinishButtonAlways: false,
                            forceMoveForward: false,
                            saveState: false,
                            startIndex: 0,

                             
                            transitionEffect: $.fn.steps.transitionEffect.none,
                            transitionEffectSpeed: 200,

                           
                            onStepChanging: function (event, currentIndex, newIndex) { return true; },
                            onStepChanged: function (event, currentIndex, priorIndex) { },
                            onFinishing: function (event, currentIndex) { return true; }, 
                            onFinished: function (event, currentIndex) { },

                            
                            labels: {
                                current: "current step:",
                                pagination: "Pagination",
                                finish: "Finish",
                                next: "Next",
                                previous: "Previous",
                                loading: "Loading ..."
                            }
                        };
                            $timeout(function(){
                              var wizard = $("#wizard").steps({
                                headerTag: "h2",
                                bodyTag: "section",
                                transitionEffect: "slideLeft",
                                stepsOrientation: "horizontal",
                                labels: {
                                current: "current step:",
                                pagination: "Pagination",
                                finish: "Finish",
                                next: "Next",
                                previous: "Previous",
                                loading: "Loading ..."
                                },
                                showFinishButtonAlways: true,
                                onFinished: function (event, currentIndex) { 
                                      console.log($scope.context);
                                },

                                onStepChanging: function (event, currentIndex, newIndex) { 
                                  $scope.$apply(function()
                                  {
                                    console.log("compiling template");
                                      $scope.activeStep = "Pre IF";

                                     if (!$scope.screens[newIndex].isLoaded)
                                     {
                                   
                                         var screen  = $scope.screens[newIndex];
                                         var section = $("#" + screen.name);
                                         var template = $templateCache.get(screen.url);
                                         if (!template) return;

                                         var element = $compile( template )($scope);
                                         section.append(element);
                                         screen.isLoaded = true ;
                                          
                                        
                                     }

                                        

                                  });

                                  return true;

                                 }
                            });
                          });//end timeout

                       
                         
                    });//end on
                     
              }*/
            })              

      //
      //  View Projects
       .state('viewProject', {
            url: "/viewProject",
            abstract: false,
            templateUrl: "views/templates/fullProject.html",
            resolve: { 
              data : function(Project) {
                
                return ;
              }
               
            }
          })
         
        .state('viewProject.dashboard', {
            url: "/viewProject/dashbaord",
            templateUrl: "",
            resolve: { 
              
               
            }
             
        })   



    //
    //  IDE state 
    .state('ide', {
      url: "/ide/:projectName",
      templateUrl: "views/idedebug.html",
      resolve : {
        activeProject: function(Project, $state, $stateParams){
            if (!$stateParams.projectName)
            {
                return $state.go("dashboard.viewProjects");
            }
            var activeProject = Project.getProject($stateParams.projectName);
            Project.active = activeProject;
            activeProject.$promise.then(function()
            {
              console.log(activeProject.projectName);
            })
            return activeProject.$promise;      
          }
        },
      controller:  "ideCtrlDebug"

       }
     ).state('ide.deploy', {
      url: "/deploy",
      controller:  function($state)
      {
        alert("application deployed");
      
      }

       })
     
    
  });
