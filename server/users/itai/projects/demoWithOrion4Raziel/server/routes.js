var fs = require('fs');
//modifiedbyOleg
module.exports = function(app) {

    var user =              require('./api/userApi.js')(app);

        app.get('/', function(req, res){
            console.log("here");
            fs.readFile('./app/views/index.html', function(err, page) {
                if (err){
                   console.log(err);
                   return res.send(404);
                }
                res.header('Cache-Control', 'no-cache');
                res.setHeader('Content-Type', 'text/html');
                res.write(page);
                res.end();
            });
        });

}