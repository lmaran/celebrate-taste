'use strict';

(function (customerService) {
    
    var mongoService = require('../../data/mongoService');
    var collection = 'customers';
 
 
    // ---------- OData ----------
    customerService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        mongoService.getAll(collection, query, next);
    };


    // ---------- CRUD ----------
    customerService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    customerService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };

    customerService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    customerService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- Misc ----------    
    customerService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };      
    
})(module.exports);