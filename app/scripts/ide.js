'use strict';

var app = angular.module('webideApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.bootstrap' 
])
  

 
app.directive("editor" , function($http, $compile, $timeout, EditorService, $interval)
{
    var editor;
    return    {
        template : "<div></div>",
        replace : true,
        restrict: 'AE',
        controller: function($scope)
        {
          $scope.tabs = [];
          $scope.tabs.push({title: "file" , active: true});
          
          EditorService.onSetFile(function(title, data)
          {
              EditorService.openFileMode = true;
              editor.setValue(data);
              EditorService.openFileMode = false;
              var node = $("#tree").dynatree("getActiveNode");
              var nodeData = node.data;
              EditorService.currentFile = nodeData;
              nodeData.content = data;
              $scope.tabs.push({"title": title , active: true, selected:function()
                {
                  editor.setValue(data);

                }});

          });
        },
        link:    function(scope, element)   
        {
           var tpl = "partial/editor.html";
           $http.get(tpl).success( function ( response ) {
              tpl = $compile( response)( scope );
              element.append(tpl);
              $interval(function(){

                  var history = editor.doc.getHistory();
                   
                  if (history.done.length) 
                  { 
                     EditorService.fireFileChange(editor.getValue());
                      history.done.forEach(function(obj){
                      obj.changes.forEach(function(change)
                      {
                        console.log("from: ch- " + change.from.ch + ",line:" + change.from.line);
                        console.log("to: ch- " + change.to.ch + ",line:" + change.to.line);

                        console.log("text:" + editor.doc.getRange(change.from, change.to)); 
                      })

                  }); 

                     editor.doc.clearHistory();
                  }
                      
                  

              }, 2000, 0, true);
              $timeout(function(){ 
                   var code = document.getElementById("fresheditor");
                   editor = CodeMirror(code, {
                   lineNumbers: true,
                   styleActiveLine: true,
                   matchBrackets: true,
                  // theme: "night",
                   autofocus: true,
                   mode:"javascript"
                    
                    });//editor
                    editor.on("change", function(changeObj){
                         if (EditorService.openFileMode) return;

                         EditorService.markFileAsDirty(); 
                   })

                   editor.on("changes", function(ins , changeObj){
                     console.log(JSON.stringify(changeObj));
                     EditorService.markFileAsDirty();
                     
                   });
                 
                         
               });//timout
           });
        } ,
        
      }
});


app.directive("tree" , function($http, $compile, $timeout, EditorService, FileService, TreeModelService, Project)
{
    return    {
        templateUrl : "partial/tree.html",
        replace : true,
        scope : {model:"="},
        restrict: 'AE',
        link:    function(scope, element)   
        {
         
           function editNode(node){
                  var prevTitle = node.data.title,
                    tree = node.tree;
                  // Disable dynatree mouse- and key handling
                  tree.$widget.unbind();
                  // Replace node with <input>
                  $(".dynatree-title", node.span).html("<input id='editNode' value='" + prevTitle + "'>");
                  // Focus <input> and bind keyboard handler
                  $("input#editNode")
                    .focus()
                    .keydown(function(event){
                      switch( event.which ) {
                      case 27: // [esc]
                        // discard changes on [esc]
                        $("input#editNode").val(prevTitle);
                        $(this).blur();
                        break;
                      case 13: // [enter]
                        // simulate blur to accept new value
                        $(this).blur();
                        break;
                      }
                    }).blur(function(event){
                      // Accept new value, when user leaves <input>
                      var title = $("input#editNode").val();
                      node.setTitle(title);
                      // Re-enable mouse and keyboard handlling
                      tree.$widget.bind();
                      node.focus();
                    });
            }
                   
            /*TreeModelService.onModelChanged(*/
           $(function(){ 
               var tree = false;
               
            scope.$watch("model.data", function(newVal , old)
            {
          
              if (!scope.model.data)
                    return;
              if (tree)
              $("#tree").dynatree("destroy");
             
              $("#tree").dynatree({
                        
                        persist: true,
                        "children": scope.model.data,
                        /* onClick: function(node, event) {
                            logMsg("onClick(%o, %o)", node, event);
                            
                          },*/
                          onDblClick: function(node, event) {
                            logMsg("onDblClick(%o, %o)", node, event);
                            node.toggleSelect();
                            if (node.childList) return;
                            scope.model.onFileSelect(node);

                            
                          },
                          onCreate:function(node, span){ 
                           scope.model.onTreeCreate(node, span);
                          },

                          onClick: function(node, event)
                          {
                            //scope.$apply(function(){
                               // scope.model.onShowFileInfo(node);
                              //});
                          },
                          onKeydown: function(node, event) {
                            switch( event.which ) {
                                case 113: // [F2]
                                  editNode(node);
                                  return false;
                              }
                           }
                           });//end of init 
             $("#tree").dynatree("enable");

            tree = $("#tree").dynatree("getTree");
            tree.redraw();
            });
        });
   
 
        }  
        
      }
});

app.service('EditorService', function($rootScope){
  var callbacks = [];
  var onChangeCallbacks = [];
  this.currentFile = {};
  var currentFile = this.currentFile;

    this.fireFileChange = function(updatedText) {
      currentFile.content = updatedText;
     
      onChangeCallbacks.forEach(function(c)
        {
          c.call({}, currentFile)
        })

    };
    this.onFileChange = function(callback)
    {
      if (typeof callback === "function")
      onChangeCallbacks.push(callback);
    }
    this.onSetFile = function(f)
    {
      callbacks.push(f);
    }
    this.setFile = function(data)
    {
       var node = $("#tree").dynatree("getActiveNode");
       var data = node.data;
       currentFile = data;

      callbacks.forEach(function(c)
      {
         c.call({} , currentFile.title, currentFile.content, "onSetFile");
      });
    }

    this.markFileAsDirty = function(c)
    {
      var node = $("#tree").dynatree("getActiveNode");
      var data = node.data;
      if (!data.dirty)
         {
            data.originName =  data.title;
            data.title  =  data.title  + "*";
            data.dirty = true;
            node.render();
         }
    }

    this.save = function(project)
    {
          
          var node = $("#tree").dynatree("getActiveNode");
          var data = node.data;

          if (!data.dirty) return;

          data.local = false;
          project.fileContent  = data.content;
          data.title  =  node.data.originName;
          project.fileName = data.title;
          project.filePath = data.path;
          project.$updateFile();

          //update node and refresh tree
                   
            
           data.dirty = false;
           node.render();
         
      } 
   
   

});
app.service('TreeModelService', function(){
   var model;
   var callbacks = [];
   this.onModelChanged = function(callback)
    {
      callbacks.push(callback);
      if (model)
         callback.call({}, model);
    }
    this.updateModel = function(m)
    {
        model = m;
        callbacks.forEach(function(c){
          c.call({}, model);
         });
    }
     

});

app.service('FileService', function($http, EditorService, Project){

      this.getFiles = function(dir , callback)
      {
              var data = [
                      {
                        "title": ".editorconfig",
                        "path": "c:/Temp/freshYo/.editorconfig"
                      },
                      {
                        "title": ".gitignore",
                        "path": "c:/Temp/freshYo/.gitignore"
                      },
                      {
                        "title": ".jshintrc",
                        "path": "c:/Temp/freshYo/.jshintrc"
                      },
                      {
                        "title": "app.rar",
                        "path": "c:/Temp/freshYo/app.rar"
                      }]
              callback.call({}, data);
          
      }

        this.getFile = function(filePath, callback)
       {
         $http.post('/file', {"path": filePath}).success(function(data)
          {
              callback.call({}, data);
          });
       }
});


app.controller("initTreeCtrl" , function($scope, FileService, TreeModelService)
{
 
    FileService.getFiles($scope.selectedDir, function(data)
    {
       TreeModelService.updateModel(data);
    })


  
});
 
 
app.controller("DropdownCtrl", function($scope)
{
   $scope.items = [
    "The first choice!",
    "And another choice for you.",
    "but wait! A third!"
  ];
}) 
app.controller("eastController", function($scope)
{
   $scope.screens = [{name:"TodoList"}, {name:"environments"}];
     
  });
 app.controller("DropdownCtrl", function($scope)
{
   $scope.items = [
    "The first choice!",
    "And another choice for you.",
    "but wait! A third!"
  ];
     
  }); 


app.controller("popover", function($scope)
{
   $scope.dynamicPopover = "Dashboard";
   $scope.dynamicPopoverTitle = "Team";
   $scope.dynamicPopoverTitle = "Deployment";
   $scope.dynamicPopoverTitle = "Project";
     
  });

/*
 app.controller("popover ", function($scope)
{
      $scope.dynamicPopover = "Hello, World!";
      $scope.dynamicPopoverTitle = "Title";
 

 }); */

 app.directive("ideheader" , function($http, $compile, $timeout, EditorService)
{
     
    return    {
        templateUrl : "partial/header.html",
        replace : true,
        restrict: 'AE',
        controller: function($scope)
        {
          
        },
        link:    function(scope, element)   
        {
            
        } ,
        
      }
});

  app.directive("idelayout" , function($http, $compile, $timeout, EditorService)
{
    var editor;
    return    {
        //template  : "<div id='layout' ng-transclude></div>", /*style='height:100%;width:100%;border:1px'*/
        replace : true,
        restrict: 'AE',
        transclude: true,
        controller: function($scope)
        {
           /* $(function() {
                       var layout  =  $("#layout").layout({ 
                         applyDefaultStyles: true ,
                                  north : {resizable : false, showOverflowOnHover:true},
                                  north__paneSelector:  "#north" , 
                                  west__paneSelector:   "#west"  ,
                                  center__paneSelector: "#center" ,
                                  east__paneSelector:    "#east",
                               west__togglerContent_open:   "&#8249;" // "‹"
                        ,   west__togglerContent_closed: "&#8250;" // "›"
                        ,   east__togglerContent_open:   "&#8250;" // "›"
                        ,   east__togglerContent_closed: "&#8251;" // "^"
                        ,   north__togglerContent_open:   "&#8252;" // "›"
                        ,  north__togglerContent_closed:   "&#8253;" // "›"
                                 });

            
             });*/
        },
        link:    function(scope, element)   
        {
              $timeout(function(){ 
                  $(function() {
                           var layout  =  element.layout({ 
                             applyDefaultStyles: true ,
                                      north : {resizable : false, showOverflowOnHover:true},
                                      north__paneSelector:  "#north" , 
                                      west__paneSelector:   "#west"  ,
                                      center__paneSelector: "#center" ,
                                      east__paneSelector:    "#east",
                                      south__paneSelector:   "#south",
                                   west__togglerContent_open:   "&#8249;" // "‹"
                            ,   west__togglerContent_closed: "&#8250;" // "›"
                            ,   east__togglerContent_open:   "&#8250;" // "›"
                            ,   east__togglerContent_closed: "&#8251;" // "^"
                            ,   north__togglerContent_open:   "&#8252;" // "›"
                            ,  north__togglerContent_closed:   "&#8253;" // "›"
                                     });

                
                 });});


         }
        }  
      
});