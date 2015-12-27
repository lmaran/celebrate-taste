'use strict';

(function (badgeService) {
    
    var mongoService = require('../../data/mongoService');
    var collection = 'badges';
 
 
    // ---------- OData ----------
    badgeService.getAll = function (req, next) {  
        var query = mongoService.getQuery(req);
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
    
})(module.exports);