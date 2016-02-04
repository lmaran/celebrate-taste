/* global process */
'use strict';

var winston = require('winston');
var config = require('../config/environment');
var chalk = require('chalk');
require('./rollbarTransport'); // init Rollbar transport for Winston
require('winston-loggly'); // init Loggly transport for Winston

var logger = new winston.Logger();
var scrubFields = ['password', 'oldPassword', 'newPassword', 'hashedPassword', 'salt']

// Winston && Rollbar: debug > info > warning > error
// E.g. 'info' level catches also 'warning' or 'error' but not 'debug'

if (config.env === 'production' || config.env === 'staging') {
    logger.add(winston.transports.RollbarLogger, {
        level: 'warn',  // catches just errors and warnings      
        rollbarAccessToken: config.rollbarToken,
        rollbarConfig: {
            environment: config.env,
            scrubFields:scrubFields
            //enabled: false // Sets whether reporting of errors to Rollbar is enabled (default true)
        }
    }); 
    
    logger.add(winston.transports.Loggly, {
        token: config.logglyToken,
        subdomain: config.logglySubdomain,
        tags: [config.env],
        json:true
    });     
} else { // development
    logger.add(winston.transports.Console, {
        level: 'debug', // catches all messages           
        formatter: formatterFunc
    });
    
     

    // // we don't need that for dev (only for testing)
    // //  ** do not remove it **       
    // logger.add(winston.transports.RollbarLogger, {
    //     level: 'debug', // catches all messages           
    //     rollbarAccessToken: config.rollbarToken,
    //     rollbarConfig: {
    //         environment: config.env,
    //         scrubFields:scrubFields
    //     }
    // });  
}

function formatterFunc(options) {
    // Return string will be passed to logger.
    var meta = options.meta;
    var msg = '';
    
    if(options.level === 'info' || options.level === 'warn')
        if(meta && meta.hasOwnProperty('req')){ 
            msg = msg + meta.req.method + ' ' + meta.req.url;
            if(meta.res){
                msg = msg + ' ' + getColorStatus(meta.res.statusCode) + ' - ' + meta.res.responseTime + ' ms ';// + meta.res.responseTime2;
            }
        } else {
            msg = msg + (undefined !== options.message ? options.message : '');
            if(meta && Object.keys(meta).length > 0){
                msg = msg + '\n' + JSON.stringify(meta, null, 4);
            }
        }

    else if(options.level === 'error'){
        
        if(meta && meta.req){ // meta has a 'request' object
            msg = msg + meta.req.method + ' ' + meta.req.url;
        }      
        
        // // we no longer need it because it is displayed by the Express 'errorHandler' middleware 
        // if(meta.err instanceof Error){
        //     msg = msg + '\n' + meta.err.stack; 
        // }    
    }
    
    return winston.config.colorize(options.level) + ' ' + msg;
};

function getColorStatus(status){
    var statusColor = 'green';
    if (status >= 500) statusColor = 'red';
    else if (status >= 400) statusColor = 'yellow';
    else if (status >= 300) statusColor = 'cyan';
    
    return chalk[statusColor](status);    
}

module.exports = logger;