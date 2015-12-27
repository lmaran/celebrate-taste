'use strict';

(function (preferenceService) {
    
    var mongoHelper = require('../../data/mongoHelper');
    var mongoService = require('../../data/mongoService');
    var collection = 'preferences';
 
 
    // ---------- OData ----------
    preferenceService.getAll = function (req, next) {  
        var query = mongoService.getQuery(req);
        mongoService.getAll(collection, query, next);
    };


    // ---------- CRUD ----------
    preferenceService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    preferenceService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };

    preferenceService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    preferenceService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- Misc ----------    
    preferenceService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };       
    
 
    preferenceService.getByDate = function (dateStr, next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).find({date:dateStr}, {sort:'name'}).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };
    
    preferenceService.getNextByEmployee = function (todayStr, employeeName, next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).find({date:{$gte: todayStr}, employeeName: employeeName}, {sort:'date'}).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };    
    
    preferenceService.getNextDates = function (todayStr, next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).aggregate([
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
   
    preferenceService.createMany = function (preferences, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).insertMany(preferences, next);      
        });
    };    

    
})(module.exports);