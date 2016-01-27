'use strict';

var orderLineService = require('./orderLineService');
var orderLineValidator = require('./orderLineValidator');
var importDataValidator = require('./importDataValidator');
var customerEmployeeService = require('../../customerEmployee/customerEmployeeService');
var preferenceService = require('../../preference/preferenceService');
var async = require('async');
var _ = require('lodash'); 

exports.getAll = function (req, res) {
    var orderId = req.params.id;
    orderLineService.getAll(orderId, function (err, orderLines) {
        if(err) { return handleError(res, err); }
        res.status(200).json(orderLines);        
    });
};


exports.getById = function (req, res) {
    var orderLineId = req.params.orderLineId;
    orderLineService.getById(orderLineId, function (err, orderLine) {
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
    
    orderLine.modifiedBy = req.user.name;    
    orderLine.modifiedOn = new Date(); 
        
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


exports.import = function(req, res){   
        
    var importData = req.body;
    
    importDataValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{                     
            // get 'customerEmployees' and 'prefeences'
            async.parallel([
                function(callback){
                    var odataQuery1 = {$filter:"isActive eq true"};
                    customerEmployeeService.getAll(odataQuery1, callback);                    
                },
                function(callback){
                    var odataQuery2 = {$filter:"date eq '" + importData.orderDate + "'"};
                    preferenceService.getAll(odataQuery2, callback);
                }
            ],
            function(err, results){
                // here we have the results
                
                if(err) { return handleError(res, err); }

                var employees = results[0];
                var preferences = results[1];
                var orderLines = [];
                
                // transform the string in array + remove empty lines: http://stackoverflow.com/a/19888749
                var employeesName = req.body.employeesName.split('\n').filter(Boolean);  
                
                // create a new record for each received name
                employeesName.forEach(function(employeeName){
                    var preference = _.find(preferences, function(item){
                        return item.employeeName.toLowerCase() == employeeName.toLowerCase();
                    });
                    var employee = _.find(employees, function(item){
                        return item.name.toLowerCase() == employeeName.toLowerCase();
                    });                                  
                    
                    var orderLine = {
                        orderId: importData.orderId,
                        orderDate: importData.orderDate,
                        eatSeries: importData.eatSeries,
                        employeeName: employee ? employee.name : employeeName, // better formatting
                        createBy: req.user.name,
                        createdOn: new Date()
                    };
                    
                    if(employee && employee.badgeCode) orderLine.badgeCode = employee.badgeCode;
                    if(preference && preference.option1) orderLine.option1 = preference.option1;
                    if(preference && preference.option2) orderLine.option2 = preference.option2;
                    
                    orderLines.push(orderLine);
                });
                
                // save to db
                orderLineService.createMany(orderLines, function (err, response) {
                    if(err) { return handleError(res, err); }
                    res.status(201).json(response.ops[0]);
                }); 
                                                           
            });             
        }
    });

};

exports.print = function (req, res) {
    var orderId = req.params.id;
    var opCode = req.params.opCode;
    // orderLineService.getById(orderLineId, function (err, orderLine) {
    //     if(err) { return handleError(res, err); }
    //     res.json(orderLine);
    // });
     

    
    if(opCode == 'seria1') printSeries(req, res, 'Seria 1');
    if(opCode == 'seria2') printSeries(req, res, 'Seria 2');
    if(opCode == 'seria3') printSeries(req, res, 'Seria 3');
    if(opCode == 'summary') printSummary(req, res);
    
    // 
    // orderLineService.getById(orderId, function (err, order) {
    //     if(err) { return handleError(res, err); }
    //     
    // });          
    // 
           
};

function printSeries(req, res, seriesName){
    
    orderLineService.getAll(orderId, function (err, orderLines) {
        if(err) { return handleError(res, err); }
        res.status(200).json(orderLines);        
    });    
    
    console.log(seriesName);
    res.json(seriesName);    
}

function printSummary(req, res){
    console.log('symmary');
    res.json('symmary');    
}

function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
