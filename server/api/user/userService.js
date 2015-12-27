/* global Buffer */
'use strict';

(function (userService) {
    
    var crypto = require('crypto');
    var mongoHelper = require('../../data/mongoHelper');
    var mongoService = require('../../data/mongoService');
    var _ = require('lodash');
    var collection = 'users';
    
   // ---------- OData ----------
    userService.getAll = function (req, next) {
           
        var query = mongoService.getQuery(req);
        if(query.$sort === undefined) query.$sort = {name: 1}; // sort by name (asc)
        
        query.$select = query.$select || {};
        
        // v1:
        _.extend(query.$select, {salt:0, hashedPassword:0}); // exclude 'salt' and 'psw'
        
        // v2:
        //_.extend(query.$select, {name:1, email:1, role:1});
        // if(query.$select.salt) delete query.$select.salt;
        // if(query.$select.hashedPassword) delete query.$select.hashedPassword;        
        
        mongoService.getAll(collection, query, next)        
    };


    // ---------- CRUD ----------
    userService.getById = function (id, next) {
        mongoService.getById(collection, id, next);       
    };

    userService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };

    userService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    userService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- Misc ----------    
    userService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };       
    

    userService.getByEmail = function (email, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);                      
            //db.collection('users').findOne({ email: email.toLowerCase() }, {salt:0, hashedPassword:0}, next);  // exclude 'salt' and 'psw'
            db.collection('users').findOne({ email: email.toLowerCase() }, next);  // exclude 'salt' and 'psw'                   
        });
    };    
    
    userService.getByIdWithoutPsw = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);                      
            id = mongoHelper.normalizedId(id);         
            db.collection('users').findOne({ _id: id }, {salt:0, hashedPassword:0}, next);  // exclude 'salt' and 'psw'                   
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