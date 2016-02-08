'use strict';

(function (teamService) {
    
    var mongoService = require('../../data/mongoService');
    var collection = 'teams';
 
 
    // ---------- OData ----------
    teamService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {name: 1};
        mongoService.getAll(collection, query, next);
    };


    // ---------- REST ----------
    teamService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };
    
    teamService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    teamService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    teamService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- RPC ----------    
    teamService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };   
    
})(module.exports);