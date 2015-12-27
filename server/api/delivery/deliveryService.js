'use strict';

(function (deliveryService) {
    
    var mongoService = require('../../data/mongoService');
    var collection = 'deliveries';
 
 
    // ---------- OData ----------
    deliveryService.getAll = function (req, next) {  
        var query = mongoService.getQuery(req);
        mongoService.getAll(collection, query, next);
    };


    // ---------- CRUD ----------
    deliveryService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    deliveryService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };

    deliveryService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    deliveryService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- Misc ----------    
    deliveryService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };  
    
})(module.exports);