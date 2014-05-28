var     fs =                require('fs')
        , tree =            require('./treeService.js')
        , async =           require('async')
        , archiver =        require('archiver')
        , path =            require('path')
        , rimraf =          require('rimraf')
        , unzip =           require('unzip');


var createZip = function(sourceDir, destPath, specificFilesToAdd, filesToIgnore, callback){
    tree.getFilesOfDir(sourceDir, filesToIgnore, function(err, files){
        if (err)
            return callback(err);
        tree.getRelativePath(files, sourceDir, function(err, files){
            if (err)
                return callback(err);
            var specificFilesTemp = [];
            if (specificFilesToAdd){
                if (filesToIgnore){
                    specificFilesToAdd.forEach(function(file){
                        if (filesToIgnore.indexOf(file.name) == -1)
                            specificFilesTemp.push(file);
                    });
                    specificFilesToAdd = specificFilesTemp;
                }
                files = files.concat(specificFilesToAdd);
            }
            writeZip(files, destPath, callback);
        })
    })
}

var writeZip = function(files, destPath, callback) {
    if (files.length < 1)
        return callback(new Error('no files to zip'));
    var outputStream = fs.createWriteStream(destPath),
        archive = archiver('zip');
    archive.pipe(outputStream);
    files.forEach(function(item){
        archive.append(fs.createReadStream(item.path), { name: item.name });
    });
    archive.finalize(function(err, written) {
        if (err) 
            return callback(err);      
    });
    outputStream.on('close', function(err){
        if (err) 
            return callback(err);
        return callback();
    });
};

var unzipAndDeleteZip = function(sourceZipPath, destPath, callback){
    fs.createReadStream(sourceZipPath)
    .on('error', function(err){
        return callback(err);
    })
    .pipe(unzip.Extract({path: destPath}))
    .on('close', function(){
        rimraf(sourceZipPath, function(err){
          if (err) 
            return callback(err);
          return callback();
        });
    })
    .on('error', function(err){
        return callback(err);
    });
}

var unzipAndKeepZip = function(sourceZipPath, destPath, callback){
    fs.createReadStream(sourceZipPath)
    .on('error', function(err){
        return callback(err);
    })
    .pipe(unzip.Extract({path: destPath}))
    .on('close', function(){
        return callback();
    })
    .on('error', function(err){
        return callback(err);
    });
}


exports.unzipAndDeleteZip = unzipAndDeleteZip;
exports.unzipAndKeepZip = unzipAndKeepZip;
exports.createZip = createZip;
