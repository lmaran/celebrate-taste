'use strict';

(function (deliveryLogService) {
    
    var mongoService = require('../../data/mongoService');
    var collection = 'deliveryLogs';
 
 
    // ---------- OData ----------
    deliveryLogService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {createdOn: -1}; // sort by name (asc)
        mongoService.getAll(collection, query, next);
    };

    // ---------- REST ----------
    deliveryLogService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };    
    
    // ---------- RPC ----------         
    
})(module.exports);