'use strict';

var deliveryService = require('./deliveryService');
var deliveryValidator = require('./deliveryValidator');


// ---------- OData ----------
exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "300"; // if $top is not specified, return max. 1000 records
            
    deliveryService.getAll(odataQuery, function (err, deliverys) {
        if(err) { return handleError(res, err); }
        res.status(200).json(deliverys);        
    });
};


// ---------- REST ----------
exports.create = function(req, res){
    var delivery = req.body;
            
    delivery.createBy = req.user.name;    
    delivery.createdOn = new Date(); 
                
    deliveryService.create(delivery, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.insertedId);
    });           
};

exports.getById = function (req, res) {
    deliveryService.getById(req.params.id, function (err, delivery) {
        if(err) { return handleError(res, err); }
        res.json(delivery);
    });    
};

exports.update = function(req, res){
    var delivery = req.body;
    deliveryValidator.all(req, res, function(errors){
        if(errors) {
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else {
            delivery.modifiedBy = req.user.name;    
            delivery.modifiedOn = new Date(); 
                        
            deliveryService.update(delivery, function (err, response) {
                if(err) { return handleError(res, err); }
                if (!response.matchedCount) {
                    res.sendStatus(404); // not found
                } else {
                    res.sendStatus(200);
                }
            });          
        }
    }); 
};

exports.remove = function(req, res){
    var id = req.params.id;
    deliveryService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};


// ---------- RPC ----------
exports.createMany = function(req, res){
    var delivery = req.body;
    var eatSeriesList = delivery.eatSeriesList;
       
    var createdOn = new Date();
    
    var deliveries = [];
    if(eatSeriesList){
        eatSeriesList.forEach(function(eatSeries) {
            delivery.eatSeries = eatSeries;            
            deliveries.push({
                orderId: delivery.orderId,
                orderDate: delivery.orderDate,
                eatSeries:eatSeries,
                createBy: req.user.name,
                createdOn: createdOn,
                status: 'open'
            }); 
        });
    }

    // TODO - move to validation
    if(deliveries.length === 0){
        res.status(400).send({error:"lipsa eatSeries"}); // 400 - bad request
        return false;
    }

    deliveryService.createMany(deliveries, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.insertedIds[0]);
    });           
};


// ---------- Helpers ----------
function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
