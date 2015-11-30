'use strict';

var passport = require('passport');
var config = require('../../../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt'); // Middleware that validates JsonWebTokens and sets req.user to be used by later middleware
var compose = require('composable-middleware'); // Treat a sequence of middleware as middleware.
var userService = require('../userService');
var validateJwt = expressJwt({ secret: config.secrets.session });
var cookie = require('cookie');

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
    return compose()
    // Validate jwt
        .use(function (req, res, next) {
            // allow access_token to be passed through query parameter as well
            if (req.query && req.query.hasOwnProperty('access_token')) {
                req.headers.authorization = 'Bearer ' + req.query.access_token;
            };
            if(req.cookies && req.cookies.hasOwnProperty('access_token')){
                req.headers.authorization = 'Bearer ' + req.cookies.access_token;
            }
            validateJwt(req, res, next);
        })
    // Attach user to request
        .use(function (req, res, next) {
            userService.getById(req.user._id, function (err, user) {
                if (err) return next(err);
                if (!user) return res.status(401).send('Unauthorized');

                req.user = user;
                next();
            });
        });
}

function addUserIfExist() {
    return compose() 
    // Validate jwt
        .use(function (req, res, next) {
            // allow access_token to be passed through query parameter as well
            // if (req.query && req.query.hasOwnProperty('access_token')) {
            //     req.headers.authorization = 'Bearer ' + req.query.access_token;
            // };
            if(req.cookies && req.cookies.access_token){
                req.headers.authorization = 'Bearer ' + req.cookies.access_token;
                validateJwt(req, res, next);
            } else
                next();
        })
    // Attach user to request
        .use(function (req, res, next) {
            if(req.user)
                userService.getById(req.user._id, function (err, user) {
                    if (err) return next(err);
                    //if (!user) return res.status(401).send('Unauthorized');
                    if (!user) next();
                    req.user = user;
                    next();
                });
            else
                next();
        });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
    if (!roleRequired) throw new Error('Required role needs to be set');

    return compose()
        .use(isAuthenticated())
        .use(function meetsRequirements(req, res, next) {
            if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
                next();
            }
            else {
                res.status(403).send('Forbidden');
            }
        });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
    return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60 * 24 * 7 }); // 7 days
}

// /**
//  * Set token cookie directly for oAuth strategies; used by Social login controllers
//  */
// function setTokenCookie(req, res) {
//     if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.' });
//     var token = signToken(req.user._id, req.user.role);
//     res.cookie('token', JSON.stringify(token));
//     res.redirect('/');
// }

// used by loginLocalController
function setCookies(req, res, token, userProfile){        
    var milliseconds = 1000*60*60*24*365;  // (1000 = 1 sec) http://stackoverflow.com/a/9718416/2726725
    var isSecure = process.env.NODE_ENV == 'production'; // in production the coockie is sent only over https
    
    //res.cookie('TOKEN', 'cookievalue', { maxAge:milliseconds, httpOnly: true, secure:isSecure });

    var c1 = cookie.serialize('access_token', token, { path:'/', maxAge:milliseconds, httpOnly: true, secure:isSecure});
    
    // 'XSRF-TOKEN' is the default name in Anguler for CSRF token     
    var c2 = cookie.serialize('XSRF-TOKEN', token, { path:'/', maxAge:milliseconds});
    
    var c3 = cookie.serialize('user', JSON.stringify(userProfile), { path:'/', maxAge:milliseconds});

    // http://www.connecto.io/blog/nodejs-express-how-to-set-multiple-cookies-in-the-same-response-object/
    res.header("Set-Cookie", [c1, c2, c3]); // array of cookies http://expressjs.com/api.html#res.set
} 

module.exports = {
    isAuthenticated: isAuthenticated,
    hasRole: hasRole,
    signToken: signToken,
    //setTokenCookie: setTokenCookie,
    setCookies: setCookies,
    addUserIfExist: addUserIfExist
}