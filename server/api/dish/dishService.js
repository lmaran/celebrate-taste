'use strict';

(function (dishService) {
    
   var mongoService = require('../../data/mongoService');
    var collection = 'dishes';
 
 
    // ---------- OData ----------
    dishService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {category: 1, name: 1}; // sort by catgeory and name
        mongoService.getAll(collection, query, next);
    };


    // ---------- CRUD ----------
    dishService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    dishService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };

    dishService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    dishService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- Misc ----------    
    dishService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };    
    
})(module.exports);