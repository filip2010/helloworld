var     fs =            require('fs')
        ,async =        require('async')
        ,path =         require('path')


var getFilesOfDir = function(sourceDir, filesToIgnore, callback){
  if (!sourceDir)
    return callback(null, []);
  traverseDirParallel(sourceDir, filesToIgnore, callback)
}

var createDirTree = function(sourceDir, filesToIgnore, callback){
  console.log("createDirTree:" + sourceDir);
  if (!sourceDir)
    return callback(null, []);
  fs.stat(sourceDir, function(err, stat) {
    if (stat && stat.isDirectory()){
      sourceDir = {type: 'dir', title: path.basename(sourceDir), path: sourceDir, children: []};
      return traverseDirInOrder(sourceDir, filesToIgnore, function(err, tree){
        if (err)
          return callback(err);
        return callback(null, tree);
      });
    } 
    else{
      return callback(new Error('source path is not a dir'), null);
    }
  });
};

var getRelativePath = function (files, baseDir, callback) {
  if (!baseDir)
    return callback(null, files);
  async.each(files, function(file, continuation){
      file.name = path.relative(baseDir, file.path);
      continuation(null);
    },
    function(err){
      if (err)
        return callback(err);
      callback(null, files);
  });
}



var traverseDirParallel = function(sourceDir, filesToIgnore, callback) {
  var results = [];
  fs.readdir(sourceDir, function(err, list) {
    if (err) 
        return callback(err);
    var pending = list.length;
    if (!pending) 
        return callback(null, results);
    list.forEach(function(file) {
      file = {name: file, path: path.join(sourceDir, file)};
      fs.stat(file.path, function(err, stat) {
        if (stat && stat.isDirectory()){
          traverseDirParallel(file.path, filesToIgnore, function(err, res) {
            results = results.concat(res);
            if (!--pending) 
                callback(null, results);
          });
        } 
        else{
          if (!filesToIgnore || filesToIgnore.indexOf(path.basename(file.name)) == -1)  
            results.push(file);
          if (!--pending) 
            callback(null, results);
        }
      });
    });
  });
}

var traverseDirInOrder = function(dir, filesToIgnore, callback) {
  fs.readdir(dir.path, function(err, list) {
    if (err) 
      return callback(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file)
        return callback(null, dir);
      file = {type: 'file', title: file, name: file, path: path.join(dir.path, file)};
      fs.stat(file.path, function(err, stat) {
        if (stat && stat.isDirectory()) {
          newDir = file;
          newDir.type = 'dir';
          newDir.children = [];
          traverseDirInOrder(newDir, filesToIgnore, function(err, res) {
            dir.children.push(res);
            next();
          });
        } else {
          dir.children.push(file);
          next();
        }
      });
    })();
  });
}




exports.getFilesOfDir = getFilesOfDir;
exports.getRelativePath = getRelativePath;
exports.createDirTree = createDirTree;


/*var sortTreeAlphabetically = function(tree, callback){
  async.sortBy(tree.children, function(child, continuation){
    continuation(null, child.name);
  }, callback);
}*/