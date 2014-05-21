fresh.directive('createProjectSettings', function($state) {
        return {
            restrict: 'E',
            scope: true ,
            template:'<form role="form">' + 
                '<div class="form-group">' + 
                    '<label for="projectName" class="">Project Name:</label>' +
                    '<input type="text" style="width:200px;" class="form-control" id="projectName" placeholder="Enter Project Name" ng-model="project.name">' +
                '</div>' +
                '<button type="submit" class="btn btn-default" state-on-click="dashboard.createProject.template">Next</button>' + 
            '</form>',
            link: function(scope, element, attrs){
            },
        }
    });