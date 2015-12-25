'use strict';

var orderDetailService = require('./orderDetailService');
var orderDetailValidator = require('./orderDetailValidator');

exports.getAll = function (req, res) {
    orderDetailService.getAll(function (err, orderDetails) {
        if(err) { return handleError(res, err); }
        res.status(200).json(orderDetails);        
    });
};


exports.getById = function (req, res) {
    orderDetailService.getById(req.params.id, function (err, orderDetail) {
        if(err) { return handleError(res, err); }
        res.json(orderDetail);
    });    
};


exports.create = function(req, res){
    var orderDetail = req.body;
    orderDetailValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
             orderDetailService.create(orderDetail, function (err, response) {
                if(err) { return handleError(res, err); }
                res.status(201).json(response.ops[0]);
            });           
        }
    });

};


exports.update = function(req, res){
    var orderDetail = req.body;
    orderDetailValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            orderDetailService.update(orderDetail, function (err, response) {
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
    orderDetailService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};


function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
