'use strict';

fresh.service('Template', ['$http', '$resource',
    function($http, $resource){

        this.allMetadata = $resource('/template/getAllTemplatesMetadata');

        this.metadataById = $resource('/template/getTemplateMetadataById/:id');

        this.metadataByName = $resource('/template/getTemplateMetadataByName/:name');
        
    }
]);

