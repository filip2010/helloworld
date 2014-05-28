var spawn =         require('child_process').spawn
    , path =        require('path')
    , fs =          require('fs');


var createProjectByYoGenerator = function(yoGenerator, username, projectName, callback){

   var child = spawn(process.env.comspec, ['/c', 'heroku', 'auth:login'], {stdio: ['pipe', 'pipe', 'pipe']});
   //console.log(child.stdio[3]);

   //child.stdout.pipe(process.stdout);
   //var pipe = child.stdio[0];
   //pipe.write('great')

   //child.stdio[1].pipe(process.stdout);
   //console.log(child);

   child.stdin.setEncoding('utf8');
   child.stdin.on('data', function(chunk){
      //child.send({bitch: "my bitch"})
      console.log("got here");
      console.log(chunk);
      //console.log("\n");
      //child.stdin.write('shalom lecha');
   });
   console.log("her1");
   setTimeout(function(){
      console.log("entering username");
      child.stdin.write('itaigen@post.bgu.ac.il');
      setTimeout(function(){
         console.log("entering password");
         child.stdin.write('1384567hg');
      }, 5000);
   }, 2000);
   
   console.log("here2");

   child.stdout.setEncoding('utf8');
   child.stdout.on('data', function(chunk){
      //child.send({bitch: "my bitch"})
      console.log("got here");
      console.log(chunk);
      //console.log("\n");
      //child.stdin.write('shalom lecha');
   });

   child.stderr.setEncoding('utf8');
   child.stderr.on('data', function(chunk){
      //child.send({bitch: "my bitch"})
      console.log("got here");
      console.log(chunk);
      //console.log("\n");
      //child.stdin.write('shalom lecha');
   });

   child.on('message', function(err){
      console.log("message:", err);
      //callback(err, null);
   })


   child.on('error', function(err){
      console.log("error:", err);
      //callback(err, null);
   })

   child.on('close', function(code){
      //console.log("here");
      console.log("closing: ", code);
      //callback(null, null);
   })

   child.on('exit', function(code){
      console.log("exiting:", code);
   })

}


exports.createProjectByYoGenerator = createProjectByYoGenerator;


createProjectByYoGenerator('angular', 'itai', 'bla', function(err ,res){
   if (err)
      console.log(err);
   else
      console.log("finished");
});