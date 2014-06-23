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

 

 function deploy(path, herokuApp , stream, callback, endCallback)
 {
  console.log("in heroku deployment");
   var gitPath;
  if(herokuApp){
   	  gitPath = 'git@heroku.com:' + herokuApp + '.git';
      stream.write(gitPath);
   	}
   	else {
   	  stream.write("app is missing");
   	  callback.call(null, "app is missing");
   	}

 if (!which('git')) {
  stream.write('Sorry, this script requires git');
  callback.call(null, "git is not installed");
 }
 
 console.log("set up staging");
 
 cd(path);
 
rm('-rf', path + "/.git/config");
console.log("git initialization ...")
if (exec('git init').code !== 0) {
    stream.write("git init failed");
    callback.call(null, 'Error: Git commit failed');
}

 

if (exec('git remote add heroku ' + gitPath).code !== 0) {
   callback.call(null, 'Error: cant add git remote');
}
console.log ("git add .");
if (exec('git add .').code !== 0) {
  echo('Error: Git add failed');
  callback.call(null, 'Error: Git add failed');
}

console.log("committing...");
if (exec('git commit -m "Auto-commit"').code !== 0) {
  callback.call(null, 'Error: Git commit failed');
  
}
 

console.log("sync with remote git");
 if (exec('git pull heroku master').code !== 0) {
  echo('Error: Git add failed');
 
}
   
   
//git config --global cre dential.helper cache

/*var spawn = require('child_process').spawn,
    gitpush  = spawn('git' , ['push heroku master']);
    gitpush.stderr.pipe(stream);

 */
 var output = exec('git push heroku master', {async:true});
 output.stderr.pipe(stream);
 output.stdout.pipe(stream);
 stream.on("data", function(data)
 {
    console.log("added data:" + data);
    console.log("----------------");
 })
 output.stdout.on("data",function(data)
 
 {
   console.log("===" + data +  "===")
 	  callback.call(null, null, data);
 });

  output.stderr.on("data",function(data)
 
 {
   console.log("===" + data +  "===")
    callback.call(null, null, data);
 });


output.stderr.on("finish", function(){
    stream.end();
    callback.call(null, null, "finished");

 })
 output.stdout.on("finish", function(){
    stream.end();
    callback.call(null, null, "finished");
    endCallback.call(null, null);

 })

 console.log("wait for complition of action")
}
 
module.exports =  deploy;