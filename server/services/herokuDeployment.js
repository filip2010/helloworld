require('shelljs/global');

 
 
 
 

 function deploy(path, herokuApp , callback)
 {
  console.log("in heroku deployment");
   var gitPath;
  if(herokuApp){
   	  gitPath = 'git@heroku.com:' + herokuApp + '.git';
      console.log(gitPath);
   	}
   	else {
   	  console.log("app is missing");
   	  callback.call(null, "app is missing");
   	}

 if (!which('git')) {
  echo('Sorry, this script requires git');
  callback.call(null, "git is not installed");
 }
 
 console.log("set up staging");
 
 cd(path);
 
 rm('-rf', path + "/.git/config");
console.log("git initialization ...")
if (exec('git init').code !== 0) {
    callback.call(null, 'Error: Git commit failed');
}

 

if (exec('git remote add heroku ' + gitPath).code !== 0) {
   callback.call(null, 'Error: cant add git remote');
}

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
 var output = exec('git push heroku master', {async:true});
 output.stdout.on("data",function(data)
 
 {
 	  callback.call(null, null, data);
 });

 console.log("wait for complition of action")
}
 
module.exports =  deploy;