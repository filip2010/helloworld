 
var unirest = require('unirest');
var url = require('url')
  
var config = {
    url : 'https://api.newrelic.com/api/v1/',
    account : 615781,
    apiHeader: 'x-api-key',
    apikey : 'f76881a2cd101ff7b5f9731d20a5af9b9ab46e3540fe372'
}

 var newRelicAPI  = {}
 newRelicAPI.getApplications = function(callback)
 {
   var requestUrl =  config.url + 'accounts/' + config.account.toString() + '/applications.json';
 

   console.log(requestUrl);
   unirest.get(requestUrl).headers({'x-api-key'  : config.apikey} )
   .end(function(res)
   {
    var data  = JSON.parse(res.raw_body);
    console.log("application are " +  JSON.stringify(data));
    callback.call(null, data);
   })

 }

 newRelicAPI.getApplication = function(appName , callback)
 {
    newRelicAPI.getApplications(function(apps)
    {
       apps.forEach(function(app){
          if (app.name === appName)
                callback(app);
       })
    });

 }

 module.exports = newRelicAPI;
