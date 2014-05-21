var temaplteCtrl = require('../controllers/templateCtrl.js');


module.exports = function (app, io) {

    app.get('/template/getTemplateFilesById/:id', temaplteCtrl.getTemplateFilesById);

    app.get('/template/getTemplateFilesByName/:name', temaplteCtrl.getTemplateFilesByName);

    app.get('/template/getAllTemplatesMetadata', temaplteCtrl.getAllTemplatesMetadata);

    app.get('/template/getTemplateMetadataById/:id', temaplteCtrl.getTemplateMetadataById);

    app.get('/template/getTemplateMetadataByName/:name', temaplteCtrl.getTemplateMetadataByName);

}