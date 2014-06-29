require('shelljs/global');

 
 
 
 function TestDeploy()
 {

  var path = "c:/temp/orion/heroku-testdeploy";
  var fs = require("fs");
  var d = new Date();
  var fileName = "file_" + d.getHours() + "_" + d.getMinutes()+ "_" + d.getSeconds() + ".txt"
  var file = fs.createWriteStream(fileName);
  deploy(path , "heroku-testdeploy", file, function(err , data){
    console.log("============");
    if (err)
    console.log("Error:" + err);
  else 
    console.log("Data:" + data);

   console.log("======");
  });
 }

 

 function deploy(path, herokuApp , io, callback, endCallback)
 {

   console.log("in heroku deployment");
   var gitPath;
   var progress = 0;

  if(herokuApp){
   	  gitPath = 'git@heroku.com:' + herokuApp + '.git';
      // callback.call(null, gitPath)
       io.emit("deployEvent", {"msg" : "git path is " +  gitPath, "progress": ++progress});
   	}
   	else {
   	  io.emit("heroku app is missing");
   	  
   	}

 if (!which('git')) {
     io.emit("deployEvent", {"data" : "git is not installed"});
  //  callback.call(null, "git is not installed");
 }
 
 
 
 cd(path);
 
rm('-rf', path + "/.git/config");
console.log("git initialization ...")
if (exec('git init').code !== 0) {
    io.emit("deployEvent", {"error" : 'Error: Git commit failed', "progress": progress});
  //  callback.call(null, 'Error: Git commit failed');
}

 

if (exec('git remote add heroku ' + gitPath).code !== 0) {
   //callback.call(null, 'Error: cant add git remote');
    io.emit("deployEvent", {"error" : 'Error: cant add git remote', "progress": progress});
}
console.log ("git add .");
if (exec('git add .').code !== 0) {
  
   io.emit("deployEvent", {"error" : 'Error: Git add failed', "progress": progress});
  // callback.call(null, 'Error: Git add failed');
}

console.log("committing...");
if (exec('git commit -m "Auto-commit"').code !== 0) {
   io.emit("deployEvent", {"error" : 'Error: Git commit failed', "progress": progress});
  //callback.call(null, 'Error: Git commit failed');
  
}
 

console.log("sync with remote git");
 if (exec('git pull heroku master').code !== 0) {
  echo('Error: Git add failed');
   io.emit("deployEvent", {"error" : 'Error: Git add failed', "progress": progress});
 
}
   
   
//git config --global cre dential.helper cache

/*var spawn = require('child_process').spawn,
    gitpush  = spawn('git' , ['push heroku master']);
    gitpush.stderr.pipe(stream);

 */
 var output = exec('git push heroku master', {async:true});
 
 output.stderr.on("data", function(data)
 {
    progress += 1;
    console.log("added data:" + data);
    io.emit("deployEvent", {"type" : "info", "data" :data, "progress" : progress});
 })
 /*output.stdout.on("data",function(data)
 
 {
   console.log("===" + data +  "===")
   io.emit("deployEvent", {"data" :data});
 	  callback.call(null, null, data);
 });*/

 


output.stderr.on("end", function(){
   
     io.emit("deployEvent", {"type" : "info", "data" : "", "progress" : "100"});
      
 })
/* output.stdout.on("finish", function(){
 
    callback.call(null, null, "finished");
    io.emit("deployEvent", {"data" : "deployment finished"});
    endCallback.call(null, null);

 })*/

 console.log("wait for complition of action")
}
 
module.exports =  deploy;