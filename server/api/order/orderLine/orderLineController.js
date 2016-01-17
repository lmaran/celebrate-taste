'use strict';

var orderLineService = require('./orderLineService');
var orderLineValidator = require('./orderLineValidator');

exports.getAll = function (req, res) {
    var orderId = req.params.id;
    orderLineService.getAll(orderId, function (err, orderLines) {
        if(err) { return handleError(res, err); }
        res.status(200).json(orderLines);        
    });
};


exports.getById = function (req, res) {
    orderLineService.getById(req.params.id, function (err, orderLine) {
        if(err) { return handleError(res, err); }
        res.json(orderLine);
    });    
};


exports.create = function(req, res){
    var orderLine = req.body;
    orderLine.createBy = req.user.name;    
    orderLine.createdOn = new Date(); 
                
    orderLineValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
             orderLineService.create(orderLine, function (err, response) {
                if(err) { return handleError(res, err); }
                res.status(201).json(response.ops[0]);
            });           
        }
    });

};


exports.update = function(req, res){
    var orderLine = req.body;
    orderLineValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            orderLineService.update(orderLine, function (err, response) {
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
    var orderLineId = req.params.orderLineId;
    orderLineService.remove(orderLineId, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};


function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
