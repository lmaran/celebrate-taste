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
    logger.add(winston.transports.Console, {
            level: 'debug',
            json: false,
            colorize: true,
        timestamp: function() {
            return Date.now();
        },            
        formatter: formatterFunc
                //handleExceptions: true,
                //humanReadableUnhandledException: true
    });
       

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

function formatterFunc(options) {
    // // Return string will be passed to logger.
    //console.log(options);
    var meta = options.meta;
    var msg = '';
    
    if(options.level === 'info')
        if(meta && meta.hasOwnProperty('headers')){ // meta is a 'request' object
            msg = msg + meta.method + ' ' + meta.url ;
        } else {
            msg = msg + (undefined !== options.message ? options.message : '');
            if(meta && Object.keys(meta).length > 0){
                msg = msg + '\n' + JSON.stringify(meta, null, 4);
            }
        }

    else if(options.level === 'error'){
        
        if(meta && meta.hasOwnProperty('headers')){ // meta is a 'request' object
            msg = msg + meta.method + meta.url;
        }      
        
        var errObj = JSON.parse(options.message);  
        
        var err = new Error();      
        err.message =errObj.message;
        err.stack = errObj.stack;  
        
        //var msgObj = (undefined !== options.message ? options.message : undefined);
        msg = msg + (undefined !== err.message ? err.message : '');   
        msg = msg + '\n' + err.stack;     
    }
    
    return winston.config.colorize(options.level) +' '+ msg;
    
    // return winston.config.colorize(options.level) + ' ' + (undefined !== options.message ? options.message : '') +
    //     (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );    
    

    // return winston.config.colorize(options.level)
    //     + ": [" + this.timestamp() + "| " + options.meta.codePath + "] "
    //     + options.message + " " + JSON.stringify(options.meta);
    
    //return 'aaa';
};


module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message.slice(0, -1)); //to remove trailing cr - http://tostring.it/2014/06/23/advanced-logging-with-nodejs/#comment-1750030723
    }
};