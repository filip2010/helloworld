fresh.directive('showInformation', function($state) {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element, attrs){
                element.bind('mouseover', function(){
                    scope.information.text = attrs.showInformation;
                    scope.$apply();
                });
            },
        }
    });