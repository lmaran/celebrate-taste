'use strict';

(function (preferenceService) {
    
    //var seedData = require("./seedData");
    var mongoHelper = require('../../data/mongoHelper');
 
    preferenceService.getAll = function (dateStr, next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.preferences.find({date:dateStr}, {sort:'name'}).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };
    
    preferenceService.getNextDates = function (todayStr, next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.preferences.aggregate([
                {$match:{date:{$gte: todayStr}}},
                {$group:{_id:"$date"}},
                {$sort:{_id:1}},
                {$group:{_id:null, array:{$push:"$_id"}}},
                {$project:{_id:0, nextDates:"$array"}}
            ]).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };    

    preferenceService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.preferences.findOne({ _id: id }, next);                           
        });
    };
    
    preferenceService.getByValue = function (field, value, id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            
            // construct the query: http://stackoverflow.com/a/17039560/2726725
            var query = {};
            
            // escape special ch.: http://stackoverflow.com/a/8882749/2726725
            // add an "\" in front of each special ch. E.g.: . ? * + ^ $ ( ) [ ] | -         
            value = value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
                         
            // search case insensitive: https://xuguoming.wordpress.com/2015/02/11/using-variable-regex-with-mongodb-query-in-node-js/
            // the "start with" (^) character is important in order to hit the index"
            query[field] = new RegExp('^' + value + '$', 'i'); 
            
            // for update we have to exclude the existing document
            if(id) query._id = {$ne: mongoHelper.normalizedId(id)}; // {name: /^John$/i, _id: {$ne:'93874502347652345'}}  
            
            db.preferences.findOne(query, next);                           
        });
    };    

    preferenceService.create = function (preference, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.preferences.insertOne(preference, next);      
        });
    };

    preferenceService.update = function (preference, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            preference._id = mongoHelper.normalizedId(preference._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.preferences.findOneAndUpdate({_id:preference._id}, preference, {returnOriginal: false}, next);
        });
    };  

    preferenceService.remove = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);               
            db.preferences.findOneAndDelete({_id:id}, next);
        });
    };
    
})(module.exports);