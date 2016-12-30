'use strict';

(function (assignedNameService) {
    
    var mongoService = require('../../data/mongoService');
    var collection = 'assignedNames';
 
 
    // ---------- OData ----------
    assignedNameService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {name: 1}; // sort by name (asc)
        mongoService.getAll(collection, query, next);
    };


    // ---------- REST ----------
    assignedNameService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };
        
    assignedNameService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    assignedNameService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    assignedNameService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- RPC ----------    
    assignedNameService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };      
    
})(module.exports);