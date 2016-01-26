'use strict';

(function (teamService) {
    
    var mongoService = require('../../data/mongoService');
    var collection = 'teams';
 
 
    // ---------- OData ----------
    teamService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {name: 1}; // sort by name (asc)
        mongoService.getAll(collection, query, next);
    };


    // ---------- CRUD ----------
    teamService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    teamService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };

    teamService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    teamService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- Misc ----------    
    teamService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };   
    
})(module.exports);