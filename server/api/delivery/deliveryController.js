'use strict';

var deliveryService = require('./deliveryService');
var deliveryValidator = require('./deliveryValidator');

exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
        
    deliveryService.getAll(odataQuery, function (err, deliverys) {
        if(err) { return handleError(res, err); }
        res.status(200).json(deliverys);        
    });
};


exports.getById = function (req, res) {
    deliveryService.getById(req.params.id, function (err, delivery) {
        if(err) { return handleError(res, err); }
        res.json(delivery);
    });    
};


exports.create = function(req, res){
    var delivery = req.body;
    deliveryValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            delivery.createBy = req.user.name;    
            delivery.createdOn = new Date(); 
                        
            deliveryService.create(delivery, function (err, response) {
                if(err) { return handleError(res, err); }
                res.status(201).json(response.ops[0]);
            });           
        }
    });

};


exports.update = function(req, res){
    var delivery = req.body;
    deliveryValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            delivery.modifiedBy = req.user.name;    
            delivery.modifiedOn = new Date(); 
                        
            deliveryService.update(delivery, function (err, response) {
                if(err) { return handleError(res, err); }
                if (!response.value) {
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


function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
