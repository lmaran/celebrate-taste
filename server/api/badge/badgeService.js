'use strict';

(function (badgeService) {
    
    //var seedData = require("./seedData");
    var mongoHelper = require('../../data/mongoHelper');
 
    badgeService.getAll = function (next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.badges.find().toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };

    badgeService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.badges.findOne({ _id: id }, next);                           
        });
    };
    
    badgeService.getByValue = function (field, value, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            var query = {};
            query[field] = value; // http://stackoverflow.com/a/17039560/2726725
            db.badges.findOne(query, next);                           
        });
    };    

    badgeService.create = function (badge, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.badges.insertOne(badge, next);      
        });
    };

    badgeService.update = function (badge, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            badge._id = mongoHelper.normalizedId(badge._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.badges.findOneAndUpdate({_id:badge._id}, badge, {returnOriginal: false}, next);
        });
    };  

    badgeService.remove = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);               
            db.badges.findOneAndDelete({_id:id}, next);
        });
    };
    
})(module.exports);