var bitbucket = require('bitbucket-api');
var credentials = {username: 'itaigen', password: 'q9zykvmY'};


var client = bitbucket.createClient(credentials);

client.getRepository({owner: 'itaigen', slug: 'testttt'}, function(err, res){
    res.issues();
})

client.create

/*
client.repositories(function(err, res){
    console.log(res);
})*/

