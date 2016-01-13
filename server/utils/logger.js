/* global process */
'use strict';

var winston = require('winston');
var rollbar = require('rollbar');
var config = require('../config/environment');
var util = require('util');

// ## Custom Winston transport -> Rollbar
var CustomLogger = winston.transports.CustomLogger = function (options) {
    this.name = 'customLogger';
    this.level = options.level || 'info';
    rollbar.init(options.rollbarAccessToken, options.rollbarConfig);
};

util.inherits(CustomLogger, winston.Transport);

// credit to: https://github.com/Ideame/winston-rollbar; 
// https://github.com/winstonjs/winston#adding-custom-transports
CustomLogger.prototype.log = function (level, msg, meta, callback) {
    
    //console.log(msg);   
    
    //if (['warn','error'].indexOf(level) > -1 && (msg instanceof Error || meta instanceof Error)) {
        
    if(level === 'error'){
        //console.log('isErr');
        var errObj = JSON.parse(msg);  
        
        var err = new Error();      
        err.message =errObj.message;
        err.stack = errObj.stack;  
        
        rollbar.handleError(err, meta); 
        
        console.log(err);        
    } else {
        rollbar.reportMessage(msg, level); 
    }
    
//     if(typeof msg === 'string'){ // msg.hasOwnProperty('stack')
//         console.log(msg);
//     } else {
// 
//     }
 
     
      
    
    callback(null, true);
};
// ## Custom Winston transport (end)


winston.emitErrs = true;

var logger = new winston.Logger();

// Winston && Rollbar: debug > info > warning > error
// E.g. 'info' level catches also 'warning' or 'error' but not 'debug'

if (config.env === 'production' || config.env === 'staging') {
    logger.add(winston.transports.CustomLogger, {
            colorize: false,
            level: 'info',          
            rollbarAccessToken: config.rollbarToken,
            rollbarConfig: {
                environment: config.env
            }
            //handleExceptions: true,
        });
} else { // development
    // logger.add(winston.transports.Console, {
    //         level: 'debug',
    //         json: false,
    //         colorize: true
    //         //handleExceptions: true,
    //         //humanReadableUnhandledException: true
    //     });

    // just for testing remote logging        
    logger.add(winston.transports.CustomLogger, {
            colorize: false,
            level: 'info',            
            rollbarAccessToken: config.rollbarToken,
            rollbarConfig: {
                environment: config.env
            }
            //handleExceptions: true,
        });  
}

//     exitOnError: false


module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message.slice(0, -1)); //to remove trailing cr - http://tostring.it/2014/06/23/advanced-logging-with-nodejs/#comment-1750030723
    }
};