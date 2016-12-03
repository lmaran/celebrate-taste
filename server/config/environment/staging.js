/* global process */
'use strict';

// Staging specific configuration (declared as "Env. variables" on the remote server)
module.exports = {
    port: process.env.PORT || 1410,
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://localhost/celebrate-taste-dev'
    },
    gaCode: 'UA-72165579-2',
    externalUrl: 'http://stg.celebrate-taste.ro',
    azureBlobStorage: {
        account: process.env.AZURE_BLOB_STORAGE_ACCOUNT,
        key: process.env.AZURE_BLOB_STORAGE_ACCESS_KEY
    },  
    azureBlobStorageCool: {
        account: process.env.AZURE_BLOB_STORAGE_COOL_ACCOUNT,
        key: process.env.AZURE_BLOB_STORAGE_COOL_ACCESS_KEY
    }    
};