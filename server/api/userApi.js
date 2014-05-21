

module.exports = function (app, io) {

    var userCtrl = require('../controllers/userCtrl.js') (app)

    console.log("userCtlr:" + JSON.stringify(userCtrl));
    app.get('/users/:id',  function(req, res){});

    app.get('/users',  function(req, res){});
    
   app.get('/home', userCtrl.ensureAuthenticated, function (req, res)
	{
		console.log("redirecting to ide main page - home.html");
		res.redirect('/home.html');
	})
 

}