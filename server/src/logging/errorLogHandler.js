'use strict'

var logger = require("./logger");
var reqHelper = require('./reqHelper'); 
var config = require('../config/environment');

function errorLogHandler(){

    return function errorHandler(err, req, res, next){
        var newReq = reqHelper.getShortReq(req);
        var meta = {req:newReq, err:err};        

        logger.error('error logger', meta);

        if(config.env === 'development'){            
            next(err); // retuns errors (and stack trace) in the browser
        } else {
            next();
        }
    }
    
}

module.exports = errorLogHandler;