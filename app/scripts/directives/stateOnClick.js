fresh.directive('stateOnClick', function($state) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs){
                element.bind('click', function(){
                    $state.go(attrs.stateOnClick);
                })

            },
        }
    });