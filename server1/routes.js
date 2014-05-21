


module.exports = function(app, io) {

    var template =              require('./api/templateApi.js')(app, io)
        , project =             require('./api/projectApi.js')(app, io);




    app.get('/*', function(req, res, next){
        res.redirect('/index.html')
    })


}