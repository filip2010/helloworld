
 

function userCtrl(app)
{ 
  var path =              require('path')
     ,fs =                require('fs')
    , rimraf =            require('rimraf')
    , passport =          require('passport')
    , GitHubStrategy =    require('passport-github').Strategy
    , mkdirp  =             require('mkdirp')
    , _ =        		  require('underscore')


var GITHUB_CLIENT_ID = "cd962d0e5806623610ea";
var GITHUB_CLIENT_SECRET = "1a4ad7f6a3309c3dc1718a392750c7c159164a69";
var users = [];
var This = {};
var configPath = path.join("." , "server", ".fresh");

function load()
{

       var usersPath = path.join(configPath , ".users");
       var usersFile = path.join(usersPath, "users.json");
       if (!fs.existsSync(usersPath))
       {
             mkdirp.sync(usersPath);
             fs.writeFileSync(usersFile, JSON.stringify([]));
       }else
        if (!fs.existsSync(usersFile))
            fs.writeFileSync(usersFile, JSON.stringify([]));

        console.log("reading " + path.join(usersPath , "users.json"));
        var content = fs.readFileSync(usersFile);
        if (!content) throw "fatal error: cant' find users.json";

        console.log("content is " + content);
        users = JSON.parse(content);
        console.log("loaded users" + JSON.stringify(users));
}

load();
function save(callback)
   {
       var usersPath = path.join(configPath , ".users");
       var usersFile = path.join(usersPath, "users.json");
       if (!callback)
        callback = function(err){
                  if (err) throw err;
                    console.log('It\'s saved!');
                  }

       console.log("repoistory was saved : " + JSON.stringify(users));
       fs.writeFile(usersFile , JSON.stringify(users), callback);
    
  }

var User = function(profile){
	this.id = profile.id;
	this.image = profile.avatar_url; 
	console.log("profile:"  + JSON.stringify(profile));
}
User.findOrCreate= function(profile, callback)
{
   var githubUrl = "https:/github.com/users";
   var err = {};
   obj = _.find(users, function(obj) { return obj.id == profile.id });

   if (obj) { 
   	  console.log("existing user logged in");
   	  console.log("user is " + JSON.stringify(profile));
   	  callback.call({}, err , profile);
   	}
   else 
   {
   	//new user
   	 users.push(profile);
   	 save(function(){  callback.call({}, err , profile);});
   } 



}

  

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:8000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile, function (err, user) {
      console.log("github strategy callback :err:" + JSON.stringify(err) +",user:" + JSON.stringify(user));
      var err1;
      if (!user) user = {}
      return done(err1, user);
    });
  } 
));


app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
  console.log("redirecting to IDE");
	res.redirect('/home');
      
  });


This.ensureAuthenticated =  function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }

  console.log(req.url);
  res.redirect('/login?code=123');
}


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  console.log("serialize user" + JSON.stringify(user));
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserialize user" + JSON.stringify(obj));
  done(null, obj);
});


return This;
}

module.exports = userCtrl;