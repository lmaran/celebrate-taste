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
                
                var availableOptions1 = getAvailableOptions(preferences, 'option1'); // => ['A', 'B']
                var availableOptions2 = getAvailableOptions(preferences, 'option2'); // => ['C', 'D']

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
                    if(preference && preference.option1){ 
                        orderLine.option1 = preference.option1;
                        orderLine.fromOwnerOpt1 = true;
                    } else {
                        // get a random value
                        orderLine.option1 = getOption(availableOptions1);
                    };
                    if(preference && preference.option2) {
                        orderLine.option2 = preference.option2;
                        orderLine.fromOwnerOpt2 = true;
                    } else {
                        // get a random value
                        orderLine.option2 = getOption(availableOptions2);                       
                    }
                    
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
    var opCode = req.params.opCode;
    
    if(opCode == 'seria1') printSeries(req, res, 'Seria 1');
    if(opCode == 'seria2') printSeries(req, res, 'Seria 2');
    if(opCode == 'seria3') printSeries(req, res, 'Seria 3');
    if(opCode == 'summary') printSummary(req, res);       
};

function printSeries(req, res, eatSeries){
    var orderId = req.params.id;
    
    orderLineService.getByOrderIdAndSeries(orderId, eatSeries, function (err, orderLines) {
        if(err) { return handleError(res, err); }
        
        var _ = require('lodash');
        var PDFDocument = require('pdfkit'); 
        var helper = require('../../../data/dateTimeHelper');                 

        var doc = new PDFDocument();
        
        if(orderLines.length == 0){
            doc.fontSize(12)
                .moveDown(2)
                .text("Nu exista date!");
        } else{
            var orderDate = orderLines[0].orderDate;
            var eatSeries = orderLines[0].eatSeries;
                
        
            doc.fontSize(30)
                .fontSize(18)
                .text("Comanda pentru " + eatSeries, {align:'center'})
                .fontSize(12)
                //.text(helper.getFriendlyDate(firstDay).dmy + '  -  ' + helper.getFriendlyDate(lastDay).dmy, {align:'center'});
                .text(helper.getStringFromString(orderDate), {align:'center'})
                .moveDown(2);
                        
            
            _.chain(orderLines)
                .map(function(orderLine, idx){
                    var orderLineTxt = orderLine.employeeName;
                    var idxCol = _.padEnd(idx + 1 + '.', 6);
                    // 
                    // if(dish.option) dishTitle = dish.option + '. ' + dish.name;  
                    // if(dish.isFasting) dishTitle = dishTitle + ' (Post)'; 
                    // if(dish.calories) dishTitle = dishTitle + ' - ' + dish.calories + ' calorii';         
                    doc.text(idxCol , {continued: true});
                    doc.text(orderLineTxt, {paragraphGap:8, continued: true});
                    doc.text(', ' + (orderLine.option1 || '-') + ' / ' + (orderLine.option2 || '-'));
                })
                .value();
        };
        
        // doc.fontSize(15)
        //     .moveDown(7)
        //     .text("Va dorim pofta buna! ", {align:'right'});

        
        res.set('Content-Type', 'application/pdf');
        doc.pipe(res);
        doc.end();                       
    });    
    
    // console.log(seriesName);
    // res.json(seriesName);    
}

function printSummary(req, res){
    console.log('comming soon');
    res.json('comming soon');    
}


function getOption(availableOptions){ // => ['A', 'B']
    if(availableOptions.length == 0) return null;
    if(availableOptions.length == 1) return availableOptions[0];

    var weightedOptions=[];

    for(var i=0; i<3; i++){ // A: 30%
        weightedOptions.push(availableOptions[0]); // => ['A','A','A']
    }
    
    for(var i=0; i<7; i++){ // B: 70%
        weightedOptions.push(availableOptions[1]) // => ['A','A','A','B','B','B','B','B','B','B']
    }    

    var randomNr=Math.floor(Math.random() * weightedOptions.length); // random nr. [0..9]

    return weightedOptions[randomNr]; // => 'A' or 'B' with probability: A: 30%, B: 70%
}

function getAvailableOptions(preferences, optionName){
    return _.chain(preferences)
        .map(function(item){
            return item[optionName]
        })
        .uniq()
        .sortBy()
        .value(); // => ['A', 'B']
}

function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
