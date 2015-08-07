/* global Buffer */
'use strict';

(function (userService) {
    
    var crypto = require('crypto');
    var mongoHelper = require('../../data/mongoHelper');
 
    userService.getAll = function (next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.users.find({}, {salt:0, hashedPassword:0}).toArray(function (err, docs) { // exclude 'salt' and 'psw'
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };

    userService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);                      
            id = mongoHelper.normalizedId(id);         
            db.users.findOne({ _id: id }, {salt:0, hashedPassword:0}, next);  // exclude 'salt' and 'psw'                   
        });
    };
    
    userService.getByEmail = function (email, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);                      
            //db.users.findOne({ email: email.toLowerCase() }, {salt:0, hashedPassword:0}, next);  // exclude 'salt' and 'psw'
            db.users.findOne({ email: email.toLowerCase() }, next);  // exclude 'salt' and 'psw'                   
        });
    };    
    
    userService.getByIdWithPsw = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.users.findOne({ _id: id }, next);                        
        });
    };

    userService.create = function (user, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.users.insertOne(user, next);      
        });
    };

    userService.update = function (user, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            user._id = mongoHelper.normalizedId(user._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.users.findOneAndUpdate({_id:user._id}, user, {returnOriginal: false}, next);
        });
    };  

    userService.remove = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);            
            db.users.findOneAndDelete({_id:id}, next);
        });
    };
    
    userService.makeSalt = function() {
        return crypto.randomBytes(16).toString('base64');
    };

    userService.encryptPassword = function(password, salt) {
        if (!password || !salt) return '';
        var newSalt = new Buffer(salt, 'base64');
        return crypto.pbkdf2Sync(password, newSalt, 10000, 64).toString('base64');
    };

    userService.authenticate = function(plainText, hashedPassword, salt) {
        return this.encryptPassword(plainText, salt) === hashedPassword;
    };

})(module.exports);