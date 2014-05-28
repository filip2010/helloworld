var express =           require('express')
    , http =            require('http')
    , path =            require('path')
    , ioSocket =        require('socket.io')
    , passport =        require('passport')
<<<<<<< HEAD
    , newrelic =        require('newrelic')
    , orionInit =           require('./orion/modules/orionode/orionServer');

if (!newrelic) throw "cant' find newrelic"
if (!orionInit) throw "can't find orion";
=======
>>>>>>> 88fff4e4781421cd5227788187fe9f050285f1a6

if(process.argv[2] == '-production')
    process.env['environment'] = 'prod';
else
    process.env['environment'] = 'dev'

var app = express();
<<<<<<< HEAD
var orion  = orionInit(app);
=======

>>>>>>> 88fff4e4781421cd5227788187fe9f050285f1a6
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
var server = http.createServer(app).listen(app.get('port'), function(){
    var io = ioSocket.listen(server);
    io.set('log level', 1);
    require('./server/routes.js')(app, io);
    console.log("Express server listening on port " + app.get('port'));
    console.log("start date is " + new Date());
    //console.log(app.routes);
});


exports.app = app;

