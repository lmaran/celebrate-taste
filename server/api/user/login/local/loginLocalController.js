'use strict';

var passport = require('passport');
var auth = require('../loginService');

// Passport Configuration (once)
require('./passportConfig');//.setup(userService, config);

exports.authenticate = function(req, res, next) {
    // auth with custom callback: http://passportjs.org/docs/authenticate
    passport.authenticate('local', function (err, user, info) {
        var error = err || info;
        if (error) return res.status(401).json(error);
        if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});
        
        var token = auth.signToken(user._id, user.role);
        res.json({token: token});
    })(req, res, next)
};