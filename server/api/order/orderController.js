'use strict';

var orderService = require('./orderService');
var orderValidator = require('./orderValidator');

exports.getAll = function (req, res) {
    orderService.getAll(req, function (err, orders) {
        if(err) { return handleError(res, err); }
        res.status(200).json(orders);        
    });
};


exports.getById = function (req, res) {
    orderService.getById(req.params.id, function (err, order) {
        if(err) { return handleError(res, err); }
        res.json(order);
    });    
};


exports.create = function(req, res){
    var order = req.body;
    // orderValidator.all(req, res, function(errors){
    //     if(errors){
    //         res.status(400).send({ errors : errors }); // 400 - bad request
    //     }
    //     else{
             orderService.create(order, function (err, response) {
                if(err) { return handleError(res, err); }
                res.status(201).json(response.ops[0]);
            });           
    //     }
    // });

};


exports.update = function(req, res){
    var order = req.body;
    // orderValidator.all(req, res, function(errors){
    //     if(errors){
    //         res.status(400).send({ errors : errors }); // 400 - bad request
    //     }
    //     else{
            orderService.update(order, function (err, response) {
                if(err) { return handleError(res, err); }
                if (!response.value) {
                    res.sendStatus(404); // not found
                } else {
                    res.sendStatus(200);
                }
            });          
    //     }
    // }); 
};


exports.remove = function(req, res){
    var id = req.params.id;
    orderService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};


function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
