/* global process */
/* global process */

"use strict";

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var winston = require('winston'); // for transports.Console
var config = require('./config/environment');

var logger = require("./utils/logger");  

// Setup server
var app = express();

require('./config/express')(app);

require('./routes')(app);

//// 1. ok (using the native Rollbar middleware)
// var rollbar = require('rollbar');
// app.use(rollbar.errorHandler(config.rollbarToken));

// // 2. ok (using Rollbar within a custom middleware)
// app.use(function (err, req, res, next) {  
//     //optional we can enrich the 'err' object using some details gathering from Winston
//     //var exceptionMeta = winston.exception.getAllInfo(err);
//     var rollbar = require('rollbar');
//     rollbar.init(config.rollbarToken);
//     rollbar.handleError(err, req);
//     next(err);   
// });

// 3.  (using Winstor within a custom middleware)

// app.use(function(req, res, next){
//     // https://aleksandrov.ws/2013/09/12/restful-api-with-nodejs-plus-mongodb/
//     res.status(404);
//     logger.debug('Not found URL: %s',req.url);
//     res.send({ error: 'Not found' });
//     return;
// });

app.use(function (err, req, res, next) {  
    //https://aleksandrov.ws/2013/09/12/restful-api-with-nodejs-plus-mongodb/
    //res.status(err.status || 500);
    //logger.error('Internal error(%d): %s',res.statusCode,err.message);
    
    var newErr = {message:err.message, stack:err.stack};

    logger.log('error', JSON.stringify(newErr), req);

    next(err);
    // res.send({ error: err.message });
    // return;   
});


    // Optionally you can include your custom error handler after the logging.
    //https://github.com/bithavoc/express-winston
    //https://github.com/expressjs/errorhandler
    var errorHandler = require('errorhandler');
    
    if (process.env.NODE_ENV === 'development') {
        // only use in development
        app.use(errorHandler())
    }   
   
    
// Start server
app.listen(config.port, config.ip, function () {
	console.log('Express server listening on %d in %s mode', config.port, config.env);
    //logger.info("Listening on " + config.port);
});

// Expose app
exports = module.exports = app; 