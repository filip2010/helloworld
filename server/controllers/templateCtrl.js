var   fs =                require('fs')
      , async =           require('async')
      , zip =             require('../services/zipService.js')
      , rimraf =          require('rimraf')
      , path =            require('path')
      , unzip =           require('unzip')
      , path =            require('path')
      ,  _     =            require('underscore');


//internal functions
var metadata = [];
var createAllTemplatesMetadata = function(callback, templatePath){

    if (metadata.length > 0) return metadata;
    console.log("[createAllTemplatesMetadata] - templates path is " + templatePath);

    if (!templatePath)
        templatePath = './server/templates';
    var dirs = fs.readdirSync(templatePath);
        if (!dirs.length)
            throw "can't read metadata , dirs = "  + JSON.stringify(dirs);

      dirs.forEach(function(dir){
                var config = fs.readFileSync(path.join( templatePath, dir, 'config.txt'));

                    metadata.push(JSON.parse(config));

                });

             metadata = _.sortBy(metadata,
                    function(config){
                         return config.id;
                    });
  return metadata;
}
createAllTemplatesMetadata(function(err){
    if (err)
        throw "can't load templates metadata, error: " + JSON.stringify(err);

});

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




var getTemplateIdByName = function(name, callback){
  createAllTemplatesMetadata(function(err, templateList){
    if (err)
      return callback(err, null);
    //console.log(templateList);
    //console.log(templateList);
    for (var i=0; i<templateList.length; i++){
      if (templateList[i].name == name)
        return callback(null, templateList[i].id)
    }
    return callback(null, null);
  });
}

var getTemplateNameById = function(id, callback){
     var meta = createAllTemplatesMetadata();
     return  meta[id-1].name;

}


exports.createAllTemplatesMetadata = createAllTemplatesMetadata;
exports.getTemplateIdByName = getTemplateIdByName;
exports.getTemplateNameById = getTemplateNameById;