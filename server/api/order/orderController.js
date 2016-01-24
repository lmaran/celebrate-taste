'use strict';

var orderService = require('./orderService');
var orderLineService = require('./orderLine/orderLineService');
var orderValidator = require('./orderValidator');

exports.getAll = function (req, res) { 
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    
    orderService.getAll(odataQuery, function (err, orders) {
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
        
            order.status = "Initiala";
            order.createBy = req.user.name;    
            order.createdOn = new Date();  
                  
            orderService.create(order, function (err, response) {                 
                if(err) { return handleError(res, err); }
                res.location(req.originalUrl + response.insertedId);
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
        
            order.modifiedBy = req.user.name;    
            order.modifiedOn = new Date(); 
                    
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
    
    // need to wait for complete? run both within a promise?
    orderLineService.removeMany(id, function (err, response) {
        if(err) { return handleError(res, err); }
        //res.sendStatus(204);
    });   
};


function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
