


module.exports = function(app, io) {

	console.log("demoserver/routes.js loaded");
    var path = require("path");
    console.log(path.resolve('./api/templateApi.js'));

    var template =                 require('./api/templateApi.js')(app, io)
        , project =                require('./api/projectApi.js')(app, io)
        , userApi =                require('./api/userApi.js')(app, io)
        , issuesApi =              require('./api/issuesApi.js')(app, io);
	app.get('/', function(req, res, next){
        console.log(req.url);
        res.redirect('/home')
    })




}