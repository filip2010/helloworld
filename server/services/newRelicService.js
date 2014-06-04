var dataProvider = require('./dataProvider');
var unirest = require('unirest');
var ulr = require('url')
var newRelicDataProvider;

var config = {
		url : 'https://api.newrelic.com/api/v1/',
		account : 615781,
		apiHeader: 'x-api-key',
		apikey : f76881a2cd101ff7b5f9731d20a5af9b9ab46e3540fe372
}

var settings = {
          timeout: 500,
          pullData : function(callback)
          {
          	     var x = (new Date()).getTime(), // current time
                 y = Math.random();
          	callback.call(null, [{x:x,y:y}]);
          	console.log("new data chank added");
          }

	    }

 newRelicDataProvider = new dataProvider(settings);
 var newRelicAPI  = {}
 newRelicAPI.getApplications = function(callback)
 {
   var url = url.resolve(config.url , 'accounts', config.account, 'applications.json');
   unirest.get(url).headers({'x-api-key'  : config.apikey )

 }

 module.exports = newRelicDataProvider;
