var express =       require('express')
    , http =        require('http');


var app = express();


app.use(express.json());
app.use(express.urlencoded());
//app.use(express.multipart());
app.use(express.methodOverride());
app.use(app.router);
app.use(function(err, req, res, next){
  //return error default
  console.log("Default Error:" + err);
  return res.send(500);
});

require('./server/routes.js')(app);


 

process.argv.forEach(function(p)
{
	console.log(p);
	if (p === "-port")
	{
		 var index =_.indexOf(process.argv, "-port");
		 if (index == -1 || index == process.argv.length)
		 	throw "error";
		 process.env.PORT =  process.argv[index + 1];
		 console.log("running server on port " + process.env.PORT);

	}
});

app.set('port', process.env.PORT ||  process.argv[2] || 8000);
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
   // console.log(app.routes);
});


exports.app = app;