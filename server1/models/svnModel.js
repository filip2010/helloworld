var Svn = function(){
    this.providers = ['Git'];

    this.Git = function(){
        this.accept = function(visitor, project, callback){
            visitor.visitGit(this, project, callback);
        }
    };

};


module.exports = Svn;
//util.inherits(Git, Svn);