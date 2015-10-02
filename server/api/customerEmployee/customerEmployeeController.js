'use strict';

var customerService = require('./customerEmployeeService');

exports.getAll = function (req, res) {
    customerService.getAll(function (err, customerEmployees) {
        if(err) { return handleError(res, err); }
        res.status(200).json(customerEmployees);        
    });
};


exports.getById = function (req, res) {
    customerService.getById(req.params.id, function (err, customerEmployee) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(customerEmployee);
    });    
};


exports.create = function(req, res){
    var customerEmployee = req.body;
    customerService.create(customerEmployee, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });
};


exports.update = function(req, res){
    var customerEmployee = req.body;
    customerService.update(customerEmployee, function (err, response) {
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