'use strict';

(function (orderService) {

    var mongoHelper = require('../../data/mongoHelper');
    var mongoService = require('../../data/mongoService');
    var collection = 'orders';
 
 
    // ---------- OData ----------
    orderService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {date: -1}; // sort by date (asc)
        mongoService.getAll(collection, query, next);
    };


    // ---------- REST ----------
    orderService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    orderService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };

    orderService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    orderService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- RPC ----------    
    orderService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };

    orderService.getByDate = function (dateStr, next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).findOne({ date:dateStr }, next);
        });
    };       
    
})(module.exports);