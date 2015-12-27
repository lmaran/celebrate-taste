'use strict';

var userService = require('./userService');

var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.status(422).json(err);
};


/**
 * Get list of users
 * restriction: 'admin'
 */
exports.getAll = function(req, res) {
    userService.getAll(req, function (err, users) {
        if(err) { return handleError(res, err); }
        res.status(200).json(users);        
    });    
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
    var user = req.body;
    user.provider = 'local';
    user.role = 'user';
    
    var password = user.password;
    user.salt = userService.makeSalt();
    user.hashedPassword = userService.encryptPassword(password, user.salt);
    delete user.password;
    
    userService.create(user, function (err, response) {
        if (err) return validationError(res, err);
        var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
        res.json({ token: token });
    });        
};

/**
 * Get a single user
 */
exports.getById = function (req, res, next) {
  var userId = req.params.id;

  userService.getByIdWithoutPsw(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

exports.update = function(req, res){
    var user = req.body;
    userService.update(user, function (err, response) {
        if(err) { return handleError(res, err); }
        if (!response.value) {
            res.sendStatus(404); // not found
        } else {
            res.sendStatus(200);
        }
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.remove = function(req, res){
    var id = req.params.id;
    userService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
    var userId = String(req.user._id); //without 'String' the result is an Object
    console.log('aaa' + userId);
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);
    
    userService.getById(userId, function (err, user) {              
        if(userService.authenticate(oldPass, user.hashedPassword, user.salt)) { 
            user.salt = userService.makeSalt();
            user.hashedPassword = userService.encryptPassword(newPass, user.salt);           
            delete user.password;
                
            userService.update(user, function(err, response) {
                if (err) return validationError(res, err);
                
                if(req.is('json')){ // http://expressjs.com/api.html#req.is 
                    res.json({}); // for requests that come from client-side (Angular)
                }
                else
                    res.redirect('/'); // for requests that come from server-side (Jade)
                
                //res.status(200).send('OK');
            });
        } else {
            res.status(403).send('Forbidden');
        }
    }); 
};


/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id.toString(); 
  userService.getByIdWithoutPsw(userId, function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

function handleError(res, err) {
    return res.status(500).send(err);
};