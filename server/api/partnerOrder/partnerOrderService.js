'use strict';

(function (partnerOrderService) {
    
   var mongoService = require('../../data/mongoService');
    var collection = 'orders';
 
 
    // ---------- OData ----------
    partnerOrderService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {date: -1}; // sort by date (asc)
        mongoService.getAll(collection, query, next);
    };


    // ---------- REST ----------

    
    // ---------- RPC ----------    

})(module.exports);