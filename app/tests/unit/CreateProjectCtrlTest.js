describe('Fresh controllers', function() {
  beforeEach(module('fresh'));
 
  describe('CreateProjectCtrl', function(){
 
    it('should create "phones" model with 3 phones', inject(function($controller) {
      var scope = {},
          ctrl = $controller('MyCtrl', { $scope: scope });
 
      scope.phones.should.have.length(3);
    }));
  });
});