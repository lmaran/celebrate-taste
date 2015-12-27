'use strict';

var deliveryService = require('./deliveryService');
var deliveryValidator = require('./deliveryValidator');

exports.getAll = function (req, res) {
    deliveryService.getAll(req, function (err, deliverys) {
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


  
  
 
