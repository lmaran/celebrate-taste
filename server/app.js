/* global process */

"use strict";

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
var logger = require("./logging/logger");
var errorLogHandler = require("./logging/errorLogHandler");

var app = express();

require('./config/express')(app);

require('./routes')(app);

// Handle error has to be last: http://expressjs.com/en/guide/error-handling.html
app.use(errorLogHandler());

// Start server
app.listen(config.port, config.ip, function () {
    logger.warn('Express server listening on %d in %s mode', config.port, config.env);
});

// Expose app
exports = module.exports = app;