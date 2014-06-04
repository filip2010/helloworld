var express =           require('express')
    , http =            require('http')
    , path =            require('path')
    , ioSocket =        require('socket.io')
    , passport =        require('passport')
    , httpProxy =       require('http-proxy')
    , orionInit =           require('./orion/modules/orionode/orionServer');

 
if (!orionInit) throw "can't find orion";

if(process.argv[2] == '-production')
    process.env['environment'] = 'prod';
else
    process.env['environment'] = 'dev'

var app = express();
var orion  = orionInit(app);
var proxy =  httpProxy.createProxyServer({});
var proxyInit = function(req, res){

    // Remove '/api' part from query string
    console.log("req url "  + req.url);
    var routerKey  = req.url.split('/').slice(1, 2).join();
    console.log(routerKey);
    if ( routerKey === 'codefresh')
    {
        req.url = '/' + req.url.split('/').slice(2).join('/');
        console.log("target url " +   req.url );
        // Create proxy

        proxy.web(req, res, { target:  "http://localhost:8000"});
        return;
    }else {
       
        // Create proxy
          proxy.web(req, res, { target:  "http://localhost:8081"})
          return;
     }

   
   

} ;
 
  
http.createServer(proxyInit).listen(7777);


app.use(express.logger({format: 'dev'}));
app.use(express.json());
app.use(express.urlencoded());
//app.use(express.multipart());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'app')));
app.use(express.static(path.join(__dirname, 'demoserver/templates')));
app.use( express.cookieParser() );
app.use(express.session({secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(function(err, req, res, next){
  //return error default
  throw err
});



app.set('port', process.env.PORT || 8000);

var server = http.createServer(app);
 



 server.listen(app.get('port'), function(){
    var io = ioSocket.listen(server);
    io.set('log level', 1);
    require('./server/routes.js')(app, io);
    console.log("Express server listening on port " + app.get('port'));
    console.log("start date is " + new Date());


    //console.log(app.routes);
});


exports.app = app;

