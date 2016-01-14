/* global process */
'use strict';
    
var winston = require('winston'); // for transports.Console
var config = require('../config/environment');
var logger = require("../utils/logger"); 
var errorHandler = require('errorhandler'); // Express native error handler

module.exports = function(app) {
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
        
        var newErr = JSON.stringify({message:err.message, stack:err.stack});
        
        // required properties: https://github.com/rollbar/node_rollbar#the-request-object
        var newReq = {
            headers: req.headers,
            protocol: req.protocol,
            url: req.url,
            method: req.method,
            body: req.body,
            route: req.route,
            user: req.user,
            ip: req.ip
        };        

        logger.error(newErr, newReq);

        next(err);
        //next();  
    });


    // Optionally you can include your custom error handler after the logging.
    //https://github.com/bithavoc/express-winston
    //https://github.com/expressjs/errorhandler
    if (config.env === 'development') {
        // only use in development... retuns errors (and stack trace) in the browser)
        app.use(errorHandler())
    }   
};