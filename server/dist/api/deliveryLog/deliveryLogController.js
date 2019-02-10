'use strict';

var deliveryLogService = require('./deliveryLogService');
// var config = require('../../config/environment');
// var _ = require('lodash');

// ---------- OData ----------
exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "100"; // if $top is not specified, return max. 100 records
        
    deliveryLogService.getAll(odataQuery, function (err, deliveryLogs) {
        if(err) { return handleError(res, err); }
        res.status(200).json(deliveryLogs);        
    });
};


// ---------- REST ----------
exports.create = function(req, res){
    var log = req.body;

    var createdOn = new Date();
    console.log(createdOn);
    
    log.createBy =req.user.name;
    log.createdOn = createdOn;

    deliveryLogService.create(log, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });           
};


// ---------- Helpers ----------
function handleError(res, err) {
    return res.status(500).send(err);
};