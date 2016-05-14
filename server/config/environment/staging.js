/* global process */
'use strict';

// Staging specific configuration (declared as "Env. variables" on the remote server)
module.exports = {
    port: process.env.PORT || 1410,
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://localhost/celebrate-taste-dev'
    },
    gaCode: 'UA-72165579-2',
    externalUrl: 'http://stg.celebrate-taste.ro'   
};