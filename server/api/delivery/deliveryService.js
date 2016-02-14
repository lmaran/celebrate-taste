'use strict';

(function (deliveryService) {
    
    var mongoHelper = require('../../data/mongoHelper');
    var mongoService = require('../../data/mongoService');
    var collection = 'deliveries';
 
 
    // ---------- OData ----------
    deliveryService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {orderDate: 1, eatSeries: 1};
        mongoService.getAll(collection, query, next);
    };


    // ---------- REST ----------
    deliveryService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };
        
    deliveryService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    deliveryService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    deliveryService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- RPC ----------    
    deliveryService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };
    
    deliveryService.createMany = function (deliveries, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).insertMany(deliveries, next);      
        });
    };    
    
})(module.exports);