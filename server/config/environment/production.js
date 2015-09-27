/* global process */
'use strict';

// Production specific configuration (declared as "Env. variables" on the remote server)
module.exports = {
    port: process.env.PORT,
    mongo: {
        uri: process.env.MONGO_URI
    }
};