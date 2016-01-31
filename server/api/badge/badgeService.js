'use strict';

(function (badgeService) {
    
    var mongoService = require('../../data/mongoService');
    var mongoHelper = require('../../data/mongoHelper');
    var collection = 'badges';
 
 
    // ---------- OData ----------
    badgeService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {name: 1}; // sort by name (asc)   
        mongoService.getAll(collection, query, next);
    };


    // ---------- CRUD ----------
    badgeService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    badgeService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };

    badgeService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    badgeService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- Misc ----------    
    badgeService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };
    
    badgeService.findOneAndUpdate = function (filter, update, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).findOneAndUpdate(filter, update, next);                           
        });
    };          
    
})(module.exports);