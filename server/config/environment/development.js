'use strict';

// Development specific configuration
module.exports = {
    port: 1410,
    mongo: {
        uri: 'mongodb://localhost/celebrate-taste-dev'
    },
    mailgun: {
        api_key: 'local'
    }, 
    zoho: {
        user: 'local', 
        psw: 'local'
    },          
    gaCode: 'local'
};
