'use strict';

var partnerOrderService = require('./partnerOrderService');

var _ = require('lodash');


// ---------- OData ----------
exports.getAll = function (req, res) { 
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "100"; // if $top is not specified, return max. 1000 records
    
    partnerOrderService.getAll(odataQuery, function (err, partnerOrders) {
        if(err) { return handleError(res, err); }
        res.status(200).json(partnerOrders);        
    });
};


// ---------- REST ----------

// ---------- RPC ----------



// ---------- Helpers ----------

function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
