//TODO make socket unique for each user, right now everybody uses the same socket

var express =           require('express')
    , http =            require('http')
    , path =            require('path')
    , ioSocket =        require('socket.io');

if(process.argv[2] == '-production')
    process.env['environment'] = 'prod';
else
    process.env['environment'] = 'dev';

var app = express();

app.use(express.logger({format: 'dev'}));
app.use(express.json());
app.use(express.urlencoded());
//app.use(express.multipart());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'app')));
app.use(express.static(path.join(__dirname, 'demoserver/templates')));
app.use(app.router);
app.use(function(err, req, res, next){
  //return error default
  throw err
});


app.set('port', process.env.PORT || 8000);
var server = http.createServer(app).listen(app.get('port'), function(){
    if (server.address().address != '0.0.0.0')
        process.env['serverIp'] = server.address().address;
    var io = ioSocket.listen(server);
    io.set('log level', 1);
    require('./demoserver/routes.js')(app, io);
    console.log("Express server listening on port " + app.get('port'));
    //console.log(app.routes);
});


exports.app = app;

