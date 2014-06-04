var assert =   require('assert')
    , should =  require('should')
    ,  newRelicAPI = require('../../services/newRelicAPI');



describe("test new relic API", function( ){
   if (!newRelicAPI) throw "new relic API is not defined";

   it("get new relic applications list", function(done){
         newRelicAPI.getApplications(function(data){
         	console.log(JSON.stringify(data));
         	done();
         });
   });

    it("get new relic application data", function(done){
         newRelicAPI.getApplication('freshintegration', function(app){
         	console.log(JSON.stringify(app));
         	done();
         });
   });

});