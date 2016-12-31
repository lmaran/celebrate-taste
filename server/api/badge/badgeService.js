'use strict';

(function (badgeService) {
    
    var mongoHelper = require('../../data/mongoHelper');
    var mongoService = require('../../data/mongoService');
    var collection = 'badges';
 
 
    // ---------- OData ----------
    badgeService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {name: 1}; // sort by name (asc)
        mongoService.getAll(collection, query, next);
    };


    // ---------- REST ----------
    badgeService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };
        
    badgeService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    badgeService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    badgeService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- RPC ----------    
    badgeService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };

    badgeService.removeAll = function (next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);          
            db.collection(collection).remove({}, next);
        });
    }; 

    badgeService.createAll = function (badges, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).insertMany(badges, next);      
        });
    };              
    
})(module.exports);