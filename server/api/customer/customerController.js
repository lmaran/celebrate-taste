﻿'use strict';

var customerService = require('./customerService');

exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
        
    customerService.getAll(odataQuery, function (err, customers) {
        if(err) { return handleError(res, err); }
        res.status(200).json(customers);        
    });
};


exports.getById = function (req, res) {
    customerService.getById(req.params.id, function (err, customer) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(customer);
    });    
};


exports.create = function(req, res){
    var customer = req.body;
    
    customer.createBy = req.user.name;    
    customer.createdOn = new Date(); 
        
    customerService.create(customer, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });
};


exports.update = function(req, res){
    var customer = req.body;
    
    customer.modifiedBy = req.user.name;    
    customer.modifiedOn = new Date();
         
    customerService.update(customer, function (err, response) {
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
    customerService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

function handleError(res, err) {
    return res.status(500).send(err);
};