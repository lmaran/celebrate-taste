'use strict';

var userService = require('./userService');

//var User = require('./userModel');
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
// exports.index = function(req, res) {
//   User.find({}, '-salt -hashedPassword', function (err, users) {
//     if(err) return res.status(500).send(err);
//     res.status(200).json(users);
//   });
// };

exports.getAll = function(req, res) {
    userService.getAll(function (err, users) {
        if(err) { return handleError(res, err); }
        res.status(200).json(users);        
    });    
};

/**
 * Creates a new user
 */
// exports.create = function (req, res, next) {
//   var newUser = new User(req.body);
//   newUser.provider = 'local';
//   newUser.role = 'user';
//   newUser.save(function(err, user) {
//     if (err) return validationError(res, err);
//     var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
//     res.json({ token: token });
//   });
// };

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
// exports.show = function (req, res, next) {
//   var userId = req.params.id;
// 
//   User.findById(userId, function (err, user) {
//     if (err) return next(err);
//     if (!user) return res.status(401).send('Unauthorized');
//     res.json(user.profile);
//   });
// };

exports.getById = function (req, res, next) {
  var userId = req.params.id;

  userService.getById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
// exports.destroy = function(req, res) {
//   User.findByIdAndRemove(req.params.id, function(err, user) {
//     if(err) return res.status(500).send(err);
//     return res.status(204).send('No Content');
//   });
// };

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
// exports.changePassword = function(req, res, next) {
//   var userId = req.user._id;
//   var oldPass = String(req.body.oldPassword);
//   var newPass = String(req.body.newPassword);
// 
//   User.findById(userId, function (err, user) {
//     if(user.authenticate(oldPass)) {
//       user.password = newPass;
//       user.save(function(err) {
//         if (err) return validationError(res, err);
//         res.status(200).send('OK');
//       });
//     } else {
//       res.status(403).send('Forbidden');
//     }
//   });
// }; 

exports.changePassword = function(req, res, next) {
    var userId = String(req.user._id); //without 'String' the result is an Object
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);
    
    userService.getByIdWithPsw(userId, function (err, user) {              
        if(userService.authenticate(oldPass, user.hashedPassword, user.salt)) {    
            user.salt = userService.makeSalt();
            user.hashedPassword = userService.encryptPassword(newPass, user.salt);
            delete user.password;
                
            userService.update(user, function(err, response) {
                if (err) return validationError(res, err);
                res.status(200).send('OK');
            });
        } else {
            res.status(403).send('Forbidden');
        }
    }); 
};


/**
 * Get my info
 */
// exports.me = function(req, res, next) {
//   var userId = req.user._id;
//   User.findOne({
//     _id: userId
//   }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
//     if (err) return next(err);
//     if (!user) return res.status(401).send('Unauthorized');
//     res.json(user);
//   });
// };

exports.me = function(req, res, next) {
  var userId = req.user._id.toString(); 
  userService.getById(userId, function(err, user) { // don't ever give out the password or salt
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

// function makeSalt() {
//     return crypto.randomBytes(16).toString('base64');
// };
// 
// function encryptPassword(password, salt) {
//     if (!password || !salt) return '';
//     var newSalt = new Buffer(salt, 'base64');
//     return crypto.pbkdf2Sync(password, newSalt, 10000, 64).toString('base64');
// };
// 
// function authenticate(plainText, hashedPassword, salt) {
//     return encryptPassword(plainText, salt) === hashedPassword;
// };