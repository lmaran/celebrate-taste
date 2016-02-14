'use strict';

var dishService = require('./dishService');


// ---------- OData ----------
exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "1000"; // if $top is not specified, return max. 1000 records
            
    dishService.getAll(odataQuery, function (err, dishes) {
        if(err) { return handleError(res, err); }
        res.status(200).json(dishes);        
    });
};


// ---------- REST ----------
exports.create = function(req, res){
    var dish = req.body;
    
    dish.createBy = req.user.name;    
    dish.createdOn = new Date(); 
                
    dishService.create(dish, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });
};

exports.getById = function (req, res) {
    dishService.getById(req.params.id, function (err, dish) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(dish);
    });    
};

exports.update = function(req, res){    
    var dish = req.body;
    
    dish.modifiedBy = req.user.name;    
    dish.modifiedOn = new Date();     
    
    dishService.update(dish, function (err, response) {
        if(err) { return handleError(res, err); }
        if (!response.value) {
            res.sendStatus(404); // not found
        } else {
            res.sendStatus(200);
        }
    });
};


exports.remove = function(req, res){
    var id = req.params.id;
    dishService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};


// ---------- Helpers ----------
function handleError(res, err) {
    return res.status(500).send(err);
};