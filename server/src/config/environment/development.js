'use strict';

// Development specific configuration
module.exports = {
    port: 1410,
    mongo: {
        uri: 'mongodb://localhost/celebrate-taste-dev'
    },
    mailgun: {
        api_key: 'key-ddfa5b01ca4cac91541645448bcdef14'
    }, 
    zoho: {
        user: 'support@celebrate-taste.ro',
        psw: 'Aa123456'
    },          
    gaCode: 'UA-72165579-1',
    externalUrl: 'http://localhost:1410',
    roUtcOffset: 0,
    azureBlobStorage: {
        account: process.env.AZURE_BLOB_STORAGE_ACCOUNT || 'celebratetastestg',
        key: process.env.AZURE_BLOB_STORAGE_ACCESS_KEY || 'ylEoTdh+UfAppb9S6AjrujBzU7/efGhLh/fUJ2X2upegxwax+9VrSNBkYbQQZcgPFpAc+hW1ymbP7LgMfKvf7w=='
    },  
    azureBlobStorageCool: {
        account: process.env.AZURE_BLOB_STORAGE_COOL_ACCOUNT || 'celebratetastecoolstg',
        key: process.env.AZURE_BLOB_STORAGE_COOL_ACCESS_KEY || 'hWt3M+O+5D2s8jshiO57yjW832sR6xvpnlsGNwRkqyznHVc0GxJy9AWMsdI2XAdWekGMyd0kJH81oQ7AHBvGaQ=='
    }        
};