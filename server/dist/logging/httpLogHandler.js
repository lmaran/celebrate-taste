// http://stackoverflow.com/a/31296619
// https://github.com/bithavoc/express-winston/blob/master/index.js

// this middleware act as a replacement for Morgan
// Morgan does not let you log req/res body: http://stackoverflow.com/a/30227670

'use strict'

var winston = require('winston'); // for transports.Console
var config = require('../config/environment');
var logger = require("./logger");
var reqHelper = require('./reqHelper');

function httpLogHandler(){

    return function httpLog(req, res, next) {
        req._startTime = new Date();

        // Manage to get information from the response too, just like Connect.logger does:
        var end = res.end;
        res.end = function (chunk, encoding) {
            var newRes = {
                statusCode: res.statusCode,
                responseTime: (new Date()) - req._startTime
            };

            res.end = end;
            res.end(chunk, encoding);

            // ---- Uncomment if you need to log the res.body ----
            //
            // if (chunk) {
            //     var isJson = (res._headers && res._headers['content-type']
            //         && res._headers['content-type'].indexOf('json') >= 0);
            //
            //     newRes.body = isJson ? JSON.parse(chunk) : chunk.toString();
            // }

            var newReq = reqHelper.getShortReq(req);
            var url = req.originalUrl || req.url;
            // ignore "/check" requests
            if(url == "/check") {
                return;
            }

            // ignore UptimeRobot's requests"
            if(req.headers && req.headers["user-agent"] && (
                req.headers["user-agent"].indexOf("UptimeRobot") !== -1 ||
                req.headers["user-agent"].indexOf("Pingdom.com") !== -1 )) {
                return;
            }

            // // remove "cookie" from header
            // if(newReq.headers && newReq.headers.cookie) {
            //     delete newReq.headers.cookie
            //     return;
            // }

            // // remove "x-xsrf-token" from header
            // if(newReq.headers && newReq.headers["x-xsrf-token"]) {
            //     delete newReq.headers["x-xsrf-token"]
            //     return next();
            // }

            // // remove "authorization" from header
            // if(newReq.headers && newReq.headers.authorization) {
            //     delete newReq.headers.authorization
            //     return next();
            // }

            var meta = {req:newReq, res:newRes};

            logger.info('http logger', meta);
        };

        next();
    }

}

module.exports = httpLogHandler;