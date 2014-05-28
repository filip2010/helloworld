var spawn =         require('child_process').spawn
    , path =        require('path')
    , fs =          require('fs')
    , net =         require('net');


console.log("entered new.js");
//process.send({hey: "hello"})
//console.log(process);

/*console.log(process.stdin);
console.log(process.stdout);
console.log(process.stderr);*/



process.on('message', function(msg){
   console.log("printing a message from a child", msg);
})

/*var xs = JSON.parse(process.stdin);
console.log(xs);*/


process.send(process.stdin.fd);
process.send(process.stdout.fd);
process.send(process.stderr.fd);

/*var pipe = new net.Socket({ fd: 0});
pipe.on('data', function(buf){
   console.log("child", "here");
})*/
//console.log("hello");

//pipe.write('hello');
