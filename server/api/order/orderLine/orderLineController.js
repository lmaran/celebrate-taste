'use strict';

var orderLineService = require('./orderLineService');
var orderLineValidator = require('./orderLineValidator');
var importDataValidator = require('./importDataValidator');
var customerEmployeeService = require('../../customerEmployee/customerEmployeeService');
var preferenceService = require('../../preference/preferenceService');
var menuService = require('../../menu/menuService');
var async = require('async');
var _ = require('lodash'); 

exports.getAll = function (req, res) {
    var orderId = req.params.id;
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
  
    // add orderId to OData query
    if(odataQuery.$filter){
        odataQuery.$filter = "orderId eq '" + orderId + "' and " + odataQuery.$filter;
    } else{
        odataQuery.$filter = "orderId eq '" + orderId + "'";
    }    
        
    orderLineService.getAll(odataQuery, function (err, orderLines) {
        if(err) { return handleError(res, err); }
        res.status(200).json(orderLines);        
    });
};


exports.getEatSeriesList = function (req, res) {
    var orderId = req.params.id;
    orderLineService.getEatSeriesList(orderId, function (err, eatSeriesList) {
        if(err) { return handleError(res, err); }
        
        // in:  [{eatSeries: "Seria 1"}, {eatSeries: "Seria 2"}, {eatSeries: "Seria 3"}]
        // out: ["Seria 1", "Seria 2", "Seria 3"]
        var eatSeriesListNew = _.map(eatSeriesList, function(eatSeries){
            return eatSeries.eatSeries;
        });
        
        res.status(200).json(eatSeriesListNew);        
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
            if(orderLine.option1 === undefined || orderLine.option1.trim() === '' 
            || orderLine.option2 === undefined || orderLine.option2.trim() === ''){
                
                // get available options
                menuService.getTodaysMenu(orderLine.orderDate, function (err, menu) {
                    if(err) { return handleError(res, err); }

                    var availableOptions1 = getAvailableOptions(menu, '1'); // => ['A', 'B']
                    var availableOptions2 = getAvailableOptions(menu, '2'); // => ['C', 'D']
                    
                    if(orderLine.option1 === undefined || orderLine.option1.trim() === ''){
                        orderLine.option1 = getOption(availableOptions1);
                    };
                    if(orderLine.option2 === undefined || orderLine.option2.trim() === ''){
                        orderLine.option2 = getOption(availableOptions2);
                    };
                    
                    // save orderLine
                    orderLineService.create(orderLine, function (err, response) {
                        if(err) { return handleError(res, err); }
                        res.status(201).json(response.ops[0]);
                    });                     
                });            
                

            } else {
                // save orderLine
                orderLineService.create(orderLine, function (err, response) {
                    if(err) { return handleError(res, err); }
                    res.status(201).json(response.ops[0]);
                });                  
            }

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
                },
                function(callback){
                    menuService.getTodaysMenu(importData.orderDate, callback);
                }                
            ],
            function(err, results){
                // here we have the results
                
                if(err) { return handleError(res, err); }

                var employees = results[0];
                var preferences = results[1];
                var menu = results[2];
                var orderLines = [];
                
                var availableOptions1 = getAvailableOptions(menu, '1'); // => ['A', 'B']
                var availableOptions2 = getAvailableOptions(menu, '2'); // => ['C', 'D']

                // transform the string in array + remove empty lines: http://stackoverflow.com/a/19888749
                var employeesName = req.body.employeesName.split('\n').filter(Boolean);  
                
                // create a new record for each received name
                employeesName.forEach(function(employeeName){
                    employeeName = employeeName.trim();
                    
                    var preference = _.find(preferences, function(item){
                        return normalize(item.employeeName) == normalize(employeeName);
                    });
                    var employee = _.find(employees, function(item){
                        return normalize(item.name) == normalize(employeeName);
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

        var doc = new PDFDocument({margins:{top:20, bottom:10, left:72, right:50}});
        
        if(orderLines.length == 0){
            doc.fontSize(12)
                .moveDown(2)
                .text("Nu exista date!");
        } else{
            var orderDate = orderLines[0].orderDate;
            var eatSeries = orderLines[0].eatSeries;
                
        
            doc.fontSize(18)
                .text("Comanda pentru " + eatSeries, {align:'center'})
                .fontSize(12)
                //.text(helper.getFriendlyDate(firstDay).dmy + '  -  ' + helper.getFriendlyDate(lastDay).dmy, {align:'center'});
                .text(helper.getStringFromString(orderDate), {align:'center'})
                .moveDown(2);
                        
            
            _.chain(orderLines)
                .map(function(orderLine, idx){
                    var orderLineTxt = orderLine.employeeName;
                    var idxCol = _.padEnd(idx + 1 + '.', 6);     
                    doc.text(idxCol , {continued: true});
                    doc.text(orderLineTxt, {paragraphGap:8, continued: true});
                    doc.text(', ' + (orderLine.option1 || '-') + ' / ' + (orderLine.option2 || '-'));
                })
                .value();
        };

        res.set('Content-Type', 'application/pdf');
        doc.pipe(res);
        doc.end();                       
    });    
  
}

function printSummary(req, res){
    var orderId = req.params.id;
    
    orderLineService.getSummary(orderId, function (err, summary) {
        if(err) { return handleError(res, err); }
        
        var _ = require('lodash');
        var PDFDocument = require('pdfkit'); 
        var helper = require('../../../data/dateTimeHelper');                 

        var doc = new PDFDocument({margins:{top:40, bottom:10, left:72, right:50}});
        
        if(summary.length == 0){
            doc.fontSize(12)
                .moveDown(2)
                .text("Nu exista date!");
                
            res.set('Content-Type', 'application/pdf');
            doc.pipe(res);
            doc.end();                 
        } else {
            var orderDate = summary[0].orderDate;
            
            menuService.getTodaysMenu(orderDate, function (err, menu) {
                if(err) { return handleError(res, err); }
                
                doc.fontSize(18)
                    .text("Centralizator comanda", {align:'center'})
                    .fontSize(12)
                    .text(helper.getStringFromString(orderDate), {align:'center'})
                    .moveDown(3);
                
                var total = [];          
                summary.forEach(function(summaryLine) {
                    doc.text(summaryLine.eatSeries + ':' , {stroke:true});
                    doc.moveDown(0.5); 
                    var options = _.sortBy(summaryLine.options, 'value');
                    options.forEach(function(option) {
                        
                        // produce a list with acumulated values:
                        // total = [{'A':107}, {'B':223}, {'C':106}, {'D':224}]
                        var t = {};
                        var key = option.value; // => 'A'
                        t[key] = option.count; // => 24
                        var existingOption = _.find(total, key);
                        if(existingOption){ // if object exists => keep the existing element but update "total count"
                            var sum = parseInt(existingOption[key]) + parseInt(option.count);
                            existingOption[key] = sum;
                        } else {
                            total.push(t);
                        }
                        
                        doc.text('     ' + key , {paragraphGap:3, continued: true});
                        doc.text(': ' + option.count + ' portii  -  ' + _.find(menu.dishes, {option: key}).name);                
                    });
                    doc.moveDown(2);                          
                });
                
                doc.text('Total:' , {stroke:true});
                doc.moveDown(0.5); 
                
                // total = [{'A':107}, {'B':223}, {'C':106}, {'D':224}]
                total.forEach(function(totalLine){
                    var key = Object.keys(totalLine)[0]; // => 'A'
                    doc.text('     ' + key , {paragraphGap:3, continued: true});
                    doc.text(': ' + totalLine[key] + ' portii  -  ' + _.find(menu.dishes, {option: key}).name);                 
                });  
                
                res.set('Content-Type', 'application/pdf');
                doc.pipe(res);
                doc.end();                                
                
            }); // end 'menuService'

        };
             
    });  // end 'orderLineService'
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

function getAvailableOptions(menu, category){
    return _.chain(menu.dishes)
        .filter({category: category})
        .map(function(item){
            return item.option;
        })
        .sortBy()
        .value(); // => ['A', 'B']
}

function handleError(res, err) {
    return res.status(500).send(err);
};

function normalize(str){
    return str.toLowerCase()
        .replace(/-/g , ' ') // replace dash with one space
        .replace(/ {2,}/g,' '); // replace multiple spaces with a single space
}
  
  
 
