/* global process */
'use strict';

// Production specific configuration (declared as "Env. variables" on the remote server)
module.exports = {
    port: process.env.PORT,
    mongo: {
        uri: process.env.MONGO_URI
    },
    gaCode: 'UA-72165579-3',
    externalUrl: 'https://celebrate-taste.ro',
    azureStorage: {
        account: process.env.AZURE_STORAGE_ACCOUNT,
        key: process.env.AZURE_STORAGE_ACCESS_KEY
    }     
};