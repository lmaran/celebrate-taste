/* global process */

"use strict";
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || "development";

var express = require("express");
var config = require("./config/environment");
//var logger = require("./logging/logger");
//var errorLogHandler = require("./logging/errorLogHandler");

var app = express();

require("./app.js")(app);

require("./routes")(app);

// Handle error has to be last: http://expressjs.com/en/guide/error-handling.html
//app.use(errorLogHandler());

// Start server
app.listen(config.port, config.ip, function() {
    //logger.warn(`Express server listening on ${config.port} in ${config.env} mode`);
    console.log(`Express server listening on ${config.port} in ${config.env} mode`);
});

// Expose app
exports = module.exports = app;
