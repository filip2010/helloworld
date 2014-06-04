var assert =   require('assert')
    , should =  require('should');

var dataProvider = function(settings)
{
	var _cashe = [];
	var _self = this;
	var _timerId;
	this.timeout = settings.timeout;
	this.pullData  = settings.pullData;
 

	if (!dataProvider.prototype.start)
    dataProvider.prototype.start = function(){ 
	 
   _timerId =  setInterval(function(){
       _self.pullData.call(_self, function(data)
       {
            _cashe = _cashe.concat(data);
       })
    },this.timeout);
}
if (!dataProvider.prototype.stop)
   dataProvider.prototype.stop = function()
 {
     console.log("stopping data collection");
     clearInterval(_timerId);
 }

if (! dataProvider.prototype.getData)
  dataProvider.prototype.getData = function()
  {
    var ret = JSON.stringify(_cashe);
    _cashe.length = 0;
    return ret;

  }
}
module.exports = dataProvider; 
/*
describe("test data provider", function()
{      

      var provider;  

	    before(function(done){
	    var settings = {
          timeout: 500,
          pullData : function(callback)
          {
          	 var x = (new Date()).getTime(), // current time
                 y = Math.random(); 

            var data = [x, y];
          	callback.call(null, data);
          	console.log("new data chank added");
          }

	    }
        provider = new dataProvider(settings);
        done();

		});

		it('check pull data ', function(done){

             provider.pullData.call(this, function(data){
                  console.log(data);
                  done();
             });

		});

	    it('data provider CRUD', function(done){
              provider.start();

              setTimeout(function(){
                var ret =  provider.getData();
                console.log(ret);
                provider.stop();
                setTimeout(function(){
                     done();
                },2000);

              }, 3000);        
   
    	});
})*/