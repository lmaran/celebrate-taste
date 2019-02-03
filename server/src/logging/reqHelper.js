'use strict';

function getShortReq(req){
    // keep in mind that some request fields could be updated later, by code: E.g.:
    //      "body" - as in 'orderController'
    //      "user" - added by Passport
    // so, use a clone of them if you want to keep the original

    // available fields: https://github.com/rollbar/node_rollbar#the-request-object
    var newReq = {
        // headers: req.headers,
        protocol: req.protocol,
        url: req.originalUrl || req.url,
        method: req.method,
        body: req.body,
        // route: req.route,
        ip: req.ip // getIp(req)
    };

    if(req.user){
        // available fields: https://github.com/rollbar/node_rollbar#person-tracking
        newReq.user = {
            //id:req.user._id,
            username: req.user.name
            //email: req.user.email
        }
    }

    return newReq;
}

// https://github.com/expressjs/morgan/blob/master/index.js
function getIp(req) {
    var ip = req.headers["X-Forwarded-For"]
        || req.ip
        || req._remoteAddress
        || (req.connection && req.connection.remoteAddress)
        || undefined;

    if(ip){
        var parts = ip.split(':');

        // IPv6 -> IPv4 ("::ffff:127.0.0.1" -> "127.0.0.1")
        return parts[parts.length-1];
    } else return '';
}

module.exports.getShortReq = getShortReq;