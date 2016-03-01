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
        user: 'support@celebrate-taste.ro', //test
        psw: 'Aa123456'
    },          
    gaCode: 'UA-72165579-1'
};
