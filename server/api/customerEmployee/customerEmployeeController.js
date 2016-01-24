'use strict';

var customerEmployeeService = require('./customerEmployeeService');
var customerEmployeeValidator = require('./customerEmployeeValidator');

exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
        
    customerEmployeeService.getAll(odataQuery, function (err, customerEmployees) {
        if(err) { return handleError(res, err); }
        res.status(200).json(customerEmployees);        
    });
};


exports.getById = function (req, res) {
    customerEmployeeService.getById(req.params.id, function (err, customerEmployee) {
        if(err) { return handleError(res, err); }
        res.json(customerEmployee);
    });    
};


exports.create = function(req, res){
    customerEmployeeValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            var customerEmployee = req.body;
            
            customerEmployee.isActive = true;
            customerEmployee.createBy = req.user.name;    
            customerEmployee.createdOn = new Date();              
            
            customerEmployeeService.create(customerEmployee, function (err, response) {
            if(err) { return handleError(res, err); }
            res.status(201).json(response.ops[0]);
        });           
        }
    });    
};


exports.update = function(req, res){
    var customerEmployee = req.body;
    customerEmployeeValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            customerEmployee.modifiedBy = req.user.name;    
            customerEmployee.modifiedOn = new Date();  
            
            customerEmployeeService.update(customerEmployee, function (err, response) {
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
    customerEmployeeService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

function handleError(res, err) {
    return res.status(500).send(err);
};