'use strict';

var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt'); // Middleware that validates JsonWebTokens and sets req.user to be used by later middleware
var compose = require('composable-middleware'); // Treat a sequence of middleware as middleware.

var userService = require('../api/user/userService');

var validateJwt = expressJwt({ secret: config.secrets.session });

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      userService.getById(req.user._id, function (err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');

        req.user = user;
        next();
      });
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
    return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*24*7 });
}

module.exports = {
    isAuthenticated: isAuthenticated,
    hasRole: hasRole,
    signToken: signToken
}