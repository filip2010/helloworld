var express =       require('express')
    , path =        require('path')
    , http =        require('http');


var app = express();


app.use(express.logger({format: 'dev'}));
app.use(express.json());
app.use(express.urlencoded());
//app.use(express.multipart());
app.use(express.static(path.join(__dirname, 'app/demo')));
app.use(express.methodOverride());
app.use(app.router);
app.use(function(err, req, res, next){
  //return error default
  console.log("Default Error:" + err);
  return res.send(500);
});

 
app.get('/', function(req, res){
  console.log("default routing");
  res.sendfile('./app/demo/index.html');
});

app.set('port', process.env.PORT || 8000);
 
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
   // console.log(app.routes);
});


exports.app = app;