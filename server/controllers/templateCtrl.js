var   fs =                require('fs')
      , async =           require('async')
      , zip =             require('../services/zipService.js')
      , rimraf =          require('rimraf')
      , path =            require('path')
      , unzip =           require('unzip')
      , path =            require('path');


var getTemplateFilesByName = function(req, res){
  getTemplateIdByName(req.params.name, function(err, result){
    if (err) throw err;
    if (result){
      var sourcePath = path.join('./server/templates', req.params.name);
      var destPath = path.join('./server/templates', req.params.name, 'files.zip');
      zip.createZip(sourcePath, destPath, null, ['config.txt', 'icon.jpg'], function(err){
          if (err){
              if (err.code == 'ENOENT')
                  return res.send(400, 'template does not exist')
              throw err;
          }
          res.sendfile(destPath, function(err){
              rimraf(destPath, function(err){
                if (err) throw err;
              });
          }) 
      }); 
    } 
    else
      return res.send(400, "template name does not exist in the database");
  });
}

var getTemplateFilesById = function(req, res){
  getTemplateNameById(req.params.id, function(err, name){
    if (err) throw err;
    if (!name)
      return res.send(400, "template id does not exist in the database");
    req.params.name = name;
    return getTemplateFilesByName(req, res);
    });
}

var getAllTemplatesMetadata = function(req, res){
  createAllTemplatesMetadata(function(err, templateList){
    if (err) throw err;
    return res.json(templateList);
  });
}

var getTemplateMetadataById = function(req, res){
  createAllTemplatesMetadata(function(err, templateList){
    if (err) throw err;
    if (req.params.id > templateList.length)
      return res.send(400, 'template id does not exist')
    else
      return res.json(templateList[req.params.id-1]);
  });
}

var getTemplateMetadataByName = function(req, res){
  if (!req.params.name)
    return res.send(400, 'a name should be passed as a parameter');
  getTemplateIdByName(req.params.name, function(err, id){
    if (err) throw err;
    if (id){
      req.params.id = id;
      return getTemplateMetadataById(req, res);
    }
    else
      return res.send(400, "template name does not exist in the database");
  })
}

exports.getTemplateFilesById = getTemplateFilesById;
exports.getTemplateFilesByName = getTemplateFilesByName;
exports.getAllTemplatesMetadata = getAllTemplatesMetadata;
exports.getTemplateMetadataById = getTemplateMetadataById;
exports.getTemplateMetadataByName = getTemplateMetadataByName;



//internal functions
var createAllTemplatesMetadata = function(callback){
  var metadata = [];
  fs.readdir('./server/templates/', function(err, dirs){
    if (err)
      return callback(err, null);
    async.each(dirs, function(dir, continuation){
      fs.readFile(path.join('./server/templates', dir, 'config.txt'), function(err, config){
        if (err)
          return callback(err, null);
        metadata.push(JSON.parse(config));
        continuation(err);
      });
      },
      function(err){
        if (err)
          return callback(err, null);
        async.sortBy(metadata, 
        function(config, continuation){
          continuation(err, config.id);
        },
        function(err, results){
          return callback(null, results);
        });
      });
  });
}

var getTemplateIdByName = function(name, callback){
  createAllTemplatesMetadata(function(err, templateList){
    if (err)
      return callback(err, null);
    //console.log(templateList);
    for (var i=0; i<templateList.length; i++){
      if (templateList[i].name == name)
        return callback(null, templateList[i].id)
    }
    return callback(null, null);
  });
}

var getTemplateNameById = function(id, callback){
  createAllTemplatesMetadata(function(err, templateList){
    if (err) 
      return callback(err, null);
    if (id > templateList.length)
      return callback(null, null);   
    else 
      return callback(null, templateList[id-1].name);
  });
}


exports.createAllTemplatesMetadata = createAllTemplatesMetadata;
exports.getTemplateIdByName = getTemplateIdByName;
exports.getTemplateNameById = getTemplateNameById;