// https://github.com/Ideame/winston-rollbar/blob/master/lib/winston-rollbar.js
// https://github.com/winstonjs/winston#adding-custom-transports

'use strict';

var util = require('util');
var winston = require('winston');
var rollbar = require('rollbar');
var config = require('../config/environment');


// ## Rollbar transport for Winston
var RollbarLogger = winston.transports.RollbarLogger = function (options) {
    this.name = 'rollbarLogger';
    this.level = options.level || 'info';
    rollbar.init(options.rollbarAccessToken, options.rollbarConfig);
};

util.inherits(RollbarLogger, winston.Transport);

RollbarLogger.prototype.log = function (level, msg, meta, callback) {

    //if (['warn','error'].indexOf(level) > -1 && (msg instanceof Error || meta instanceof Error)) {
        
    if(level === 'error'){
        rollbar.handleError(meta.err, meta.req);       
    } else {                    
        if(meta.res && meta.req){ // http request handler
            var newMsg = meta.res.statusCode + ' ' + meta.req.method + ' ' + meta.req.url + ', ' + meta.res.responseTime + 'ms';
            if(meta.req.user && meta.req.user.username){
                newMsg = newMsg + ', ' + meta.req.user.username;
            }
            rollbar.reportMessageWithPayloadData(newMsg, {level:level, response:meta.res}, meta.req);
        } else if(meta && Object.keys(meta).length > 0){ // if exist and not empty object           
            rollbar.reportMessage(msg, level, meta);
        } else {// log a simple message (w/wo meta)
            rollbar.reportMessage(msg, level);
        }
    }
    
    callback(null, true);
};