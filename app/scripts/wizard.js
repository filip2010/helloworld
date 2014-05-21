var wizard = angular.module('creationWizard', []);
 
wizard.controller("CreationWizardCtrl" , 
  function($scope, $state, Project, ProjectSocketIOEvents, $timeout)
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
                                                                        $state.go('start');
                                                                    },
                                                                    function(err){
                                                                        alert("Error: " + err.data);
                                                                    });
                                                  }



                                              
                                         });  
                                     
                                   }  
                            );
 
wizard.controller('generalStepCtrl', ['$scope', 
    function($scope){

        $scope.update = function(projectName)
        {
        	var context = $scope.project;
        	context.projectName = projectName;
        }
    }
]);
wizard.controller('techStepCtrl', ['$scope', 
    function($scope){
      $scope.update = function(item)
        {
        	var context = $scope.project;
        	context.template = item.name;
          context.templateId = item.templateId;
        }
    }
 
]);

wizard.controller('repoStepCtrl', ['$scope', 
    function($scope){
      $scope.update = function(item)
        {
        	var context = $scope.project;
        	context.repo = item.title;
        }
    }
   
]);


wizard.controller('deploymentStepCtrl', ['$scope', 
    function($scope){

       $scope.update = function(item)
        {
        	var context = $scope.project;
        	context.deployment = item.title;
   	   }
}
]);

wizard.controller("mainWizardCtrl",['$scope', '$state' , '$timeout',
 '$templateCache', '$compile' , 'ProjectSocketIOEvents', 'Project', function($scope, $state,  $timeout, $templateCache, $compile, ProjectSocketIOEvents, Project){
                var events = ProjectSocketIOEvents; 
                $scope.project = {};
                var d = new Date();
                $scope.project.projectName = "testproject_"  + d.getDate() + "_" + d.getMinutes() + "_" + d.getSeconds();
                var activeScreen = {};
                $scope.showWizard = true;
                $scope.templates = [{title:"Angular", templateId:1, name : "angular.js-node.js" , icon:"img/icon-angular.png"},  
                 {title:"Demo Template", name:"demo-template", templateId:2, icon:"img/demo.jpg"}, 
                 {title:"Backbone", templateId:3, icon:"img/icon-backbonejs.png"}, 
                 {title:"NodeJS", icon: "img/icon-node.png"} 
                       , {title:"Facebook", templateId:3, icon:"img/icon-facebook.png"}];
                $scope.repo  = [{title:"BitBucket",icon:"img/icon-bitbucket.png"},  {title:"GitHub", icon:"img/icon-github.png"}];
                $scope.env =   [{title:"Amazon",icon:"img/icon-amazon.png"},  {title:"Heroku", icon:"img/icon-heroku.png"},  {title:"CloudBees", icon: "img/icon-cloudbees.png"}];
                $scope.trackingTools = [
                {title:"Jira",icon:"img/jira.png"},
                {title:"Rally",icon:"img/rally.png"},
                {title:"Agile Manager",icon:"img/hp.png"}];
                $scope.monitoring =   [
                {title:"New Relic",icon:"img/newrelic.jpg"},
                {title:"App Dynamic",icon:"img/appdynamics.png"},
                {title:"NodeTime",icon:"img/empty.png"}];

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
                            } };

                function Screen (name, url)
                {
                  this.name = name;
                  if (url)
                  {
                    this.url = url
                  }else 
                    this.url = name + ".html";

                  this.isLoaded = false; }
                $scope.screens = [new Screen("tech"), new Screen("repo"), new Screen("deployment")];
                 
                $scope.update = function(t){
                          
                          t.selected = "selected";
                          $scope.context[activeScreen].screen.handler()
                         // t.context[$scope.screens[$scope.currentIndex]] = t.title ;
                 }
               
                var closeWizard = function(){
                     //close wizard
                      
                     	$scope.showWizard  = false;
                      function createProject(args)
                      {

                      var newProject  = Project.createProject(args.projectName, args.templateId);
                           newProject.$promise.then(function(val){
                             console.log("project was created" + val);
                            $scope.project = val;
                            Project.active = val;
                           });


                        
                      }
                      createProject($scope.project);
                      $state.go("start");
                    
                };
                $scope.closeWizard = closeWizard;
                $scope.$watch("projectName", function(newVal , old){
                       $scope.projectNameCss = ["has-success"];
                });
                var setStepTemplate  = function(currentIndex, newIndex)
                {
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
                }

             
                $scope.$on('$viewContentLoaded', function(){
                 
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
                                	 $scope.$apply(function onWizardClosed(){
                                      console.log($scope.project);
                                      var context = $scope.project;
                                      if (!context.projectName) {
                                      	  $scope.projectNameCss = {'haserror':true};
                                      	  $timeout(function()
                                      	  {
                                            $scope.projectNameCss = {'haserror':false};
                                      	  }, 3000);
                                      	return false;
                                      }
                                      closeWizard();
                                      $scope.$emit("OnWizardClosed", $scope.project);


									})
                                },

                                onStepChanging: function (event, currentIndex, newIndex) { 
                                   setStepTemplate(currentIndex , newIndex);

                                  return true;

                                 }
                            });//end wizard()

					setStepTemplate(0, 0);

                   });//end timeout
				})//on 

 
}]);
 


                       
                         
               
                     
         
 
