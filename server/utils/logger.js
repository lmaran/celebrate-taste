'use strict';

// https://github.com/imperugo/NodeJs-Sample/blob/master/Logging/WinstonSample/utils/logger.js
var winston = require('winston');
var rollbar = require('rollbar');

var config = require('../config/environment');

var util = require('util');

var CustomLogger = winston.transports.CustomLogger = function (options) {
    this.name = 'customLogger';
    this.level = options.level || 'info';
    rollbar.init(options.rollbarAccessToken, options.rollbarConfig);
};

util.inherits(CustomLogger, winston.Transport);

CustomLogger.prototype.log = function (level, msg, meta, callback) {
    var errObj = JSON.parse(msg);
    var err = new Error(errObj.message);
    err.stack = errObj.stack;   
     
    rollbar.handleError(err, meta);   
    
    callback(null, true);
};

winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        // new winston.transports.File({
        //     level: 'info',
        //     filename: './logs/all-logs.log',
        //     handleExceptions: true,
        //     json: true,
        //     //eol: 'eol', // 'rn' for Windows, or `eol: ‘n’,` for *NIX OSs
        //     //timestamp: true,
        //     maxsize: 5242880, //5MB
        //     maxFiles: 5,
        //     colorize: true
        // }),
        
        // new winston.transports.Console({
        //     level: 'debug',
        //     //handleExceptions: true,
        //     json: false,
        //     colorize: true
        //     //humanReadableUnhandledException: true
        // }),
        
        
        new winston.transports.CustomLogger({
            colorize: false,
            //handleExceptions: true,
            level: 'info', // default 'warn'            
            rollbarAccessToken: config.rollbarToken,
            // metadataAsRequest: true,
            rollbarConfig: {
                environment: config.env
            }
        })                    
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message.slice(0, -1)); //to remove trailing cr - http://tostring.it/2014/06/23/advanced-logging-with-nodejs/#comment-1750030723
    }
};