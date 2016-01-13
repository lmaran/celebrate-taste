/* global process */
/* global process */

"use strict";

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
var logger = require("./utils/logger");

// Setup server
var app = express();

require('./config/express')(app);

require('./routes')(app);

// Handle error has to be last, after other app.use() and routes calls;" - http://expressjs.com/en/guide/error-handling.html
require('./config/errorHandler')(app);
    
// Start server
app.listen(config.port, config.ip, function () {
    logger.info('Express server listening on %d in %s mode', config.port, config.env);
});

// Expose app
exports = module.exports = app; 