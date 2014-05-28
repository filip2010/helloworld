var sandbox = angular.module('sandbox', []);


sandbox.controller("sendBoxMainCtrl" , 
  function($scope,$http, $state, Project, ProjectSocketIOEvents, $timeout,EditorService, TreeModelService){

   
   $scope.model = {data : {}};
   var debug  = {}
   debug.collapseWindow = "Close";
   debug.collapse  = false;
   debug.onCollapse = function()
   {
     debug.collapse = !debug.collapse;
     if (debug.collapse)
     {
        debug.collapseWindow = "Open";
     }else 
        debug.collapseWindow = "Close";
   }

   $scope.debug = debug;
   $scope.collapseDebug = false;

    EditorService.onFileChange(function(fileData)
    {
      $scope.$apply(function()
      {
         
          var data = fileData;
          fileData.local = false;
          $scope.project.fileContent  = data.content;
          $scope.project.fileName = data.title;
          $scope.project.filePath = data.path;
          $scope.project.$updateFile();

      })
    })


   $scope.model.onTreeCreate = function(node, span)
   {
        function bindContextMenu(span) {
        // Add context menu to this node:
         $.contextMenu( {
              selector: ".dynatree-title", 
              callback: function(key, options) {
                  var m = "clicked: " + key;
                  window.console && console.log(m) || alert(m); 
              },
              build:function(trigger , el)
              {
                   console.log("context menu is about to be built");
                   return {
                         callback: function(key, options) {
                                   var nodeName = trigger.html();
                                   var node;
                                   var tree = $("#tree").dynatree("getTree");//.getNodeByKey(trigger.html());
                                   tree.visit(function(n)
                                   {  
                                      var depth = n.getLevel();
                                      var left = "";
                                      for (var i=0; i < depth; i++)
                                      {
                                        left = left + " ";
                                      }
                                      console.log(left + n.data.title);
                                      if (n.data.title === nodeName)
                                      {
                                         node = n.data;
                                         n.addChild({
                                          title: "newFile.html", 
                                          content : "<!DOCTYPE html>" +
                                          "<html><head><title></title></head><body>"+
                                          "</body></html>",
                                          dirty: false,
                                          path:n.data.path + "/newFile.html"});
                                       }
                                   });
                                   var m = "clicked: " + key + "," + trigger.html()  + node.title;
                                   window.console && console.log(m) || alert(m); 
                                   },
                    items: {
                    
                    "new": {name: "New",
                           items : {
                              html  : {name : "html file", callback : function(trigger, el){
                                var tree = $("#tree").dynatree("getTree");
                                var node = $.ui.dynatree.getNode(el.$trigger);
                                if (node)
                                  node.addChild({title: "newFile.html", content : "<!DOCTYPE html>" +
                                          "<html><head><title></title></head><body>"+
                                          "</body></html>",
                                          dirty:false,
                                          local: true,
                                          path:node.data.path + "/newFile.html" 

                                        });
                                console.log(".html file was created");}},
                              js  :   {name :"js file", callback : function(trigger, el){

                                console.log(".js file was created");},
                               }
                           } ,
                           icon: "edit"},
                    "cut": {name: "Cut", icon: "cut"},
                    "copy": {name: "Copy", icon: "copy"},
                    "paste": {name: "Paste", icon: "paste"},
                    "delete": {name: "Delete", icon: "delete"},
                    "sep1": "---------",
                    "quit": {name: "Quit", icon: "quit"}
                    }
                 }
              },
              items: {
                  "edit": {name: "Edit", icon: "edit"},
                  "cut": {name: "Cut", icon: "cut"},
                  "copy": {name: "Copy", icon: "copy"},
                  "paste": {name: "Paste", icon: "paste"},
                  "delete": {name: "Delete", icon: "delete"},
                  "sep1": "---------",
                  "quit": {name: "Quit", icon: "quit"}
              }
         });
      }
      if (node.hasChildren())
      bindContextMenu(span);
   }



   $scope.model.onShowFileInfo = function(node)
   {
     $scope.fileInfo = node.data;
     if (node.data.local)
      {   
          var data = node.data;
          data.local = false;
          $scope.project.fileContent  = data.content;
          $scope.project.fileName = data.title;
          $scope.project.filePath = data.path;
          $scope.project.$addNewFile();//{"fileName":data.path, "fileContent":data.content});
      }
   }
   $scope.model.onFileSelect  = function(node)
   {
       
          if (node.data.content)
             EditorService.setFile(node.data.title, node.data.content);
          else
          $http({method:"GET", url:"/projects/" + Project.active.projectName +  "/files" ,
                    params: {file :node.data.path}}).success(function(data)
                {
                                                     
                     var t = ["hello world" , '\n', "i am good"];
                      var result =  (function bin2String(array) {
                        var result = "";
                                        for (var i = 0; i < array.length; i++) {
                                          result += String.fromCharCode(parseInt(array[i]));
                                        }
                                        return result;
                                      })(data)
                                 node.data.content = data;
                                 EditorService.setFile(node.data);
                                 
                             }). error(function(data, status, headers, config) {
                                       console.log("error" +  status);
                                    });
   }
    
   $scope.userProjects = Project.getAllProjects();
   $scope.createProject = function(templateId)
   {
    var d = new Date();
    var project = {};
    project.name = "project_" + d.getDate() + "_" + d.getMinutes() + "_" + d.getSeconds();
    $scope.project = project;
    var newProject  = Project.createProject(project.name, templateId);
     newProject.$promise.then(function(val){
       console.log("project was created" + val);
      $scope.project = val;
      Project.active = val;
     });
    }
    $scope.openProject = function(projectToOpen)
    {
       var newProject  = Project.getProject(projectToOpen);
         newProject.$promise.then(function(val){
         console.log("user opened project" + val);
         $scope.project = val;
          $scope.model.data = val.filesTree;
          //TreeModelService.updateModel(val.filesTree);
          Project.active = val;
       });
    }
    $scope.getProjectTree = function()
    {
        $scope.project.$getFiles(function(val){
        $scope.project.filesTree = val.filesTree; 
        $scope.model.data = val.filesTree;

        TreeModelService.updateModel(val.filesTree);

        });
        
    }

    $scope.createNewFile = function(fileName , fileContent)
    { 
      var fileContent = "hello world file " + (new Date()).toString();
      $scope.project.fileName = fileName;
      $scope.project.fileContent = fileContent;
      $scope.project.$addNewFile({"fileName":fileName});
    }

   
    $(function(){
              $.contextMenu({
              selector: '.context-menu-one', 
              callback: function(key, options) {
                  var m = "clicked: " + key;
                  window.console && console.log(m) || alert(m); 
              },
              build:function(trigger)
              {
                   console.log("context menu is about to be built");
                   return {
                         callback: function(key, options) {
                                   var m = "clicked: " + key;
                                   window.console && console.log(m) || alert(m); 
                                   },
                    items: {
                    "edit": {name: "Edit", icon: "edit"},
                    "cut": {name: "Cut", icon: "cut"},
                    "copy": {name: "Copy", icon: "copy"},
                    "paste": {name: "Paste", icon: "paste"},
                    "delete": {name: "Delete", icon: "delete"},
                    "sep1": "---------",
                    "quit": {name: "Quit", icon: "quit"}
                    }
                 }
              },
              items: {
                  "edit": {name: "Edit", icon: "edit"},
                  "cut": {name: "Cut", icon: "cut"},
                  "copy": {name: "Copy", icon: "copy"},
                  "paste": {name: "Paste", icon: "paste"},
                  "delete": {name: "Delete", icon: "delete"},
                  "sep1": "---------",
                  "quit": {name: "Quit", icon: "quit"}
              }
          });
    
          $('.context-menu-one').on('click', function(e){
              console.log('clicked', this);
          })
        });
   
         
});
 
sandbox.controller("ideCtrlDebug" , 
  function($window,   $scope,$http, $state, Project, ProjectSocketIOEvents, $timeout,EditorService, TreeModelService){

      var events = ProjectSocketIOEvents;

   $scope.model = {data : {}};
   if (Project.active)
   {
       $scope.model.data = Project.active.filesTree;
       $scope.project = Project.active; 
  } 
   var debug  = {}
   debug.collapseWindow = "Close";
   debug.collapse  = false;
   debug.onCollapse = function()
   {
     debug.collapse = !debug.collapse;
     if (debug.collapse)
     {
        debug.collapseWindow = "Open";
     }else 
        debug.collapseWindow = "Close";
   }

   $scope.debug = debug;
   $scope.collapseDebug = false;

    EditorService.onFileChange(function(fileData)
    {
          var phase = (!$scope.root) ? $scope.$$phase : $scope.$root.$$phase;
          if (!phase) 
            $scope.$apply(function(){EditorService.save($scope.project)});
        else 
          EditorService.save($scope.project); 

    });


   $scope.model.onTreeCreate = function(node, span)
   {
        function bindContextMenu(span) {
        // Add context menu to this node:
         $.contextMenu( {
              selector: ".dynatree-title", 
              callback: function(key, options) {
                  var m = "clicked: " + key;
                  window.console && console.log(m) || alert(m); 
              },
              build:function(trigger , el)
              {
                   console.log("context menu is about to be built");
                   return {
                         callback: function(key, options) {
                                   var nodeName = trigger.html();
                                   var node;
                                   var tree = $("#tree").dynatree("getTree");//.getNodeByKey(trigger.html());
                                   tree.visit(function(n)
                                   {  
                                      var depth = n.getLevel();
                                      var left = "";
                                      for (var i=0; i < depth; i++)
                                      {
                                        left = left + " ";
                                      }
                                      console.log(left + n.data.title);
                                      if (n.data.title === nodeName)
                                      {
                                         node = n.data;
                                         n.addChild({
                                          title: "newFile.html", 
                                          content : "<!DOCTYPE html>" +
                                          "<html><head><title></title></head><body>"+
                                          "</body></html>",
                                          dirty: false,
                                          path:n.data.path + "/newFile.html"});
                                       }
                                   });
                                   var m = "clicked: " + key + "," + trigger.html()  + node.title;
                                   window.console && console.log(m) || alert(m); 
                                   },
                    items: {
                    
                    "new": {name: "New",
                           items : {
                              html  : {name : "html file", callback : function(trigger, el){
                                var tree = $("#tree").dynatree("getTree");
                                var node = $.ui.dynatree.getNode(el.$trigger);
                                if (node)
                                  node.addChild({title: "newFile.html", content : "<!DOCTYPE html>" +
                                          "<html><head><title></title></head><body>"+
                                          "</body></html>",
                                          dirty:false,
                                          local: true,
                                          path:node.data.path + "/newFile.html" 

                                        });
                                console.log(".html file was created");}},
                              js  :   {name :"js file", callback : function(trigger, el){

                                console.log(".js file was created");},
                               }
                           } ,
                           icon: "edit"},
                    "cut": {name: "Cut", icon: "cut"},
                    "copy": {name: "Copy", icon: "copy"},
                    "paste": {name: "Paste", icon: "paste"},
                    "delete": {name: "Delete", icon: "delete"},
                    "sep1": "---------",
                    "quit": {name: "Quit", icon: "quit"}
                    }
                 }
              },
              items: {
                  "edit": {name: "Edit", icon: "edit"},
                  "cut": {name: "Cut", icon: "cut"},
                  "copy": {name: "Copy", icon: "copy"},
                  "paste": {name: "Paste", icon: "paste"},
                  "delete": {name: "Delete", icon: "delete"},
                  "sep1": "---------",
                  "quit": {name: "Quit", icon: "quit"}
              }
         });
      }
      if (node.hasChildren())
      bindContextMenu(span);
   }



   $scope.model.onShowFileInfo = function(node)
   {
     $scope.fileInfo = node.data;
     if (node.data.local)
      {   
          var data = node.data;
          data.local = false;
          $scope.project.fileContent  = data.content;
          $scope.project.fileName = data.title;
          $scope.project.filePath = data.path;
          $scope.project.$addNewFile();//{"fileName":data.path, "fileContent":data.content});
      }
   }
   $scope.model.onFileSelect  = function(node)
   {
       
          if (node.data.content)
             EditorService.setFile(node.data);
          else
          $http({method:"GET", url:"/projects/" + Project.active.projectName +  "/files" ,
                    params: {file :node.data.path}}).success(function(data)
                {
                                                     
                     var t = ["hello world" , '\n', "i am good"];
                      var result =  (function bin2String(array) {
                        var result = "";
                                        for (var i = 0; i < array.length; i++) {
                                          result += String.fromCharCode(parseInt(array[i]));
                                        }
                                        return result;
                                      })(data)
                                 node.data.content = data;
                                 EditorService.setFile(node.data);
                                 
                             }). error(function(data, status, headers, config) {
                                       console.log("error" +  status);
                                    });
   }
    
   $scope.userProjects = Project.getAllProjects();

   $scope.createProject = function(templateId)
   {
    var d = new Date();
    var project = {};
    project.name = "project_" + d.getDate() + "_" + d.getMinutes() + "_" + d.getSeconds();
    $scope.project = {name: project, fullScreen: false};
    var newProject  = Project.createProject(project.name, templateId);
     newProject.$promise.then(function(val){
       console.log("project was created" + val);
      $scope.project = val;
      Project.active = val;

     });
    }

    $scope.openProject = function(projectToOpen)
    {
       var newProject  = Project.getProject(projectToOpen);
         newProject.$promise.then(function(val){
         console.log("user opened project" + val);
         $scope.project = val;
          $scope.model.data = val.filesTree;
          //TreeModelService.updateModel(val.filesTree);
          Project.active = val;
       });
    }

    $scope.getProjectTree = function()
    {
        $scope.project.$getFiles(function(val){
        $scope.project.filesTree = val.filesTree; 
        $scope.model.data = val.filesTree;

        TreeModelService.updateModel(val.filesTree);

        });
        
    }

    $scope.createNewFile = function(fileName , fileContent)
    { 
      var fileContent = "hello world file " + (new Date()).toString();
      $scope.project.fileName = fileName;
      $scope.project.fileContent = fileContent;
      $scope.project.$addNewFile({"fileName":fileName});
    }

    $scope.deploy = function(provider)
    {
        alert('Starting your deployment please wait..');
       $scope.project.provider = provider;
       var ret = $scope.project.$deploy();
       ret.then(function(data)
       {
           var promise = events.register('Deployment');
           promise.then(function(success){
               console.log(success);
           }, function(error){
               console.log(error);
           }, function(update){
               console.log(update);
           });

            if (provider == 'local'){
                var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
                var ref = $window.open(data.deployUrl, "CNN_WindowName", strWindowFeatures);
                ref.focus();
            }

        //alert(JSON.stringify(data.deployUrl));
       }, function(err){
           alert(err.data);
       });
    }

     $scope.stopInstance = function()
     {
          var ret = $scope.project.$stopInstance();
          ret.then(function(data)
          {
              var promise = events.register('StopInstance');
              promise.then(function(success){
                  console.log(success);
              }, function(error){
                  console.log(error);
              }, function(update){
                  console.log(update);
              });

              //alert(JSON.stringify(data.Instances));
          }, function(err){
              alert(err.data);
          });
     }

      $scope.describeInstance = function()
      {
          var ret = $scope.project.$describeInstance();
          ret.then(function(data)
          {
              alert(JSON.stringify(data.instance[0]));
          }, function(err){
              alert(err.data);
          });
      }

   
    
   
         
});

                       
                         
               
                     
         
 
