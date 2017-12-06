'use strict';

var orderService = require('./orderService');
var orderLineService = require('../orderLine/orderLineService');
var customerEmployeeService = require('../customerEmployee/customerEmployeeService');
var badgeService = require('../badge/badgeService');
var menuService = require('../menu/menuService');
var orderValidator = require('./orderValidator');
var _ = require('lodash');
var helper = require('../../data/dateTimeHelper');   
var helperService = require('../../data/helperService');
var PDFDocument = require('pdfkit'); 
var async = require('async');

// ---------- OData ----------
exports.getAll = function (req, res) { 
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "100"; // if $top is not specified, return max. 1000 records
    
    orderService.getAll(odataQuery, function (err, orders) {
        if(err) { return handleError(res, err); }
        res.status(200).json(orders);        
    });
};


// ---------- REST ----------
exports.create = function(req, res){
    var order = req.body;
        
    order.status = "open";
    order.createBy = req.user.name;    
    order.createdOn = new Date();  
            
    orderService.create(order, function (err, response) {                 
        if(err) { return handleError(res, err); }
        res.location(req.originalUrl + response.insertedId);
        res.status(201).json(response.ops[0]);
    });           
};

exports.getById = function (req, res) {
    orderService.getById(req.params.id, function (err, order) {
        if(err) { return handleError(res, err); }
        res.json(order);
    });    
};

exports.update = function(req, res){
    var order = req.body;
        
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


// ---------- RPC ----------
exports.print = function (req, res) {
    var opCode = req.params.opCode;
    
    if(opCode == 'seria1') printSeries(req, res, 'Seria 1');
    if(opCode == 'seria2') printSeries(req, res, 'Seria 2');
    if(opCode == 'seria3') printSeries(req, res, 'Seria 3');
    if(opCode == 'summary') printSummary(req, res);     
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

exports.getDeliverySummary = function (req, res) {
    var orderId = req.params.id;
    var eatSeries = req.params.eatSeries;
    orderLineService.getDeliverySummary(orderId, eatSeries, function (err, deliverySummary) {
        if(err) { return handleError(res, err); }
        res.status(200).json(deliverySummary);
    });
};

exports.closeOrder = function (req, res) {
    var orderId = req.params.id;

    let p1 = promiseToGetOrderById(orderId);
    let p2 = promiseToGetOrderSummaryById(orderId); // get orderLines (for specific order)
    let p3 = promiseToGetCustomerEmployees("");
    let p4 = promiseToGetBadges("");
    
    Promise.all([p1, p2, p3, p4]).then(function(results){
        let order = results[0];
        let orderLines = results[1];
        let customerEmployees = results[2];
        let badges = results[3];

        // add badgeCode to each orderLine
        orderLines.forEach(function(orderLine){
            let employee = helperService.getEmployeeByName(orderLine.employeeName, customerEmployees);
            if(employee){
                let badge = helperService.getBadgeByEmployee(employee, badges);           
                orderLine.badgeCode = badge && badge.code;
            }
        });

        var orderSummary = getOrderSummary(order, orderLines);

        order.status = "completed";
        order.summary = orderSummary;
        order.modifiedBy = req.user.name;    
        order.modifiedOn = new Date();         
        
        orderService.update(order, function (err, response) {});        
        
        res.status(200).json(orderSummary);
    })
    .catch(function(err){
        return handleError(res, err);
    })   

}


// ---------- Helpers ----------
function printSeries(req, res, eatSeries){
    var orderId = req.params.id;
    
    orderLineService.getByOrderIdAndSeries(orderId, eatSeries, function (err, orderLines) {
        if(err) { return handleError(res, err); }                
        
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

        var doc = new PDFDocument({margins:{top:40, bottom:10, left:50, right:20}});
        
        if(summary.length == 0){
            doc.fontSize(16)
                .moveDown(2)
                .text("Nu exista date!");
                
            res.set('Content-Type', 'application/pdf');
            doc.pipe(res);
            doc.end();                 
        } else {
            var orderDate = summary[0].orderDate;
            
            menuService.getTodaysMenu(orderDate, function (err, menu) {
                if(err) { return handleError(res, err); }

                doc.fontSize(22)
                    .text("Centralizator comanda", {align:'center'})
                    .fontSize(16)
                    .text(helper.getStringFromString(orderDate), {align:'center'})
                    .moveDown(3);
                
                var total = [];          
                summary.forEach(function(summaryLine) {
                    doc.text(summaryLine.eatSeries + ':' , {stroke:true});
                    doc.moveDown(0.5); 
                    var options = _.sortBy(summaryLine.options, 'value');
                    options.forEach(function(option) {
                        if(option.value){
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
                        }            
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

function getOrderSummary(order, orderLines){
    var summary = {
        ordered:{
            total:0,
            s1:0,
            s2:0,
            s3:0
        },  
        noBadge:{
            total:0,
            details:[] // list of {series:'', name:''}
        }     

        // unknowEmployees: [], // list of unknow employees, during import        
        // uncknowBadges :[], // list of unknow badges, during delivery (TODO: add it during delivery)
        // notOrdered:[] // list of persons with no order (TODO: add it during delivery)
                        
    };
    
    var firstOrderLine = orderLines[0];
    
    // init 'delivered' and 'undelivered'
    if(firstOrderLine.hasOwnProperty('status')){
        summary.delivered = {
            total:0,
            s1:0,
            s2:0,
            s3:0         
        };
        summary.undelivered = {
            total:0,
            s1:0,
            s2:0,
            s3:0,
            details:[] // list of {series:'', name:''}         
        }       
    }    
    
    // init 'manualDelivered'  
    if(order.date >= '2016-04-18'){ // we don't have info before this date
        summary.manualDelivered = {
            total:0,
            s1:0,
            s2:0,
            s3:0,
            details:[] // list of {series:'', name:''}            
        }     
    }
    
    orderLines.forEach(function(o){
        if (o.eatSeries === "Seria 1") {
            summary.ordered.s1++; 
            summary.ordered.total++;
            
            if(summary.delivered){
                if (o.status === "completed") {
                    summary.delivered.s1++; 
                    summary.delivered.total++;
                } else {
                    summary.undelivered.s1++;
                    summary.undelivered.total++; 
                    summary.undelivered.details.push({series:o.eatSeries, name:o.employeeName});
                }
            }
            
            if (summary.manualDelivered && o.deliveryMode === "manual") {
                summary.manualDelivered.s1++; 
                summary.manualDelivered.total++;
                summary.manualDelivered.details.push({series:o.eatSeries, name:o.employeeName});
            }            
        }
        if (o.eatSeries === "Seria 2") {
            summary.ordered.s2++; 
            summary.ordered.total++;
            
            if(summary.delivered){
                if (o.status === "completed") {
                    summary.delivered.s2++; 
                    summary.delivered.total++;
                } else {
                    summary.undelivered.s2++; 
                    summary.undelivered.total++;
                    summary.undelivered.details.push({series:o.eatSeries, name:o.employeeName});
                }
            }
            
            if (summary.manualDelivered && o.deliveryMode === "manual") {
                summary.manualDelivered.s2++; 
                summary.manualDelivered.total++;
                summary.manualDelivered.details.push({series:o.eatSeries, name:o.employeeName});
            }             

        }
        if (o.eatSeries === "Seria 3") {
            summary.ordered.s3++; 
            summary.ordered.total++;
            
            if(summary.delivered) {
                if (o.status === "completed") {
                    summary.delivered.s3++; 
                    summary.delivered.total++;
                } else {
                    summary.undelivered.s3++; 
                    summary.undelivered.total++;
                    summary.undelivered.details.push({series:o.eatSeries, name:o.employeeName});
                }
            }
            
            if (summary.manualDelivered && o.deliveryMode === "manual") {
                summary.manualDelivered.s3++; 
                summary.manualDelivered.total++;
                summary.manualDelivered.details.push({series:o.eatSeries, name:o.employeeName});
            }             
        }                

        if(!o.badgeCode) {
            summary.noBadge.total++;
            summary.noBadge.details.push({series:o.eatSeries, name:o.employeeName});
        }
             
    }); 
    
    // final corrections ()
    // for period 08-19 feb.2016 the status  for all records has been 'open'
    if(summary.delivered && summary.delivered.total === 0){
        delete summary.delivered;
        delete summary.undelivered;
    }
    
    return summary;   
}

// ---------- Helpers ----------
function handleError(res, err) {
    return res.status(500).send(err);
};

function promiseToGetOrderById(orderId){
    return new Promise(function(resolve, reject) {
        orderService.getById(orderId, function (err, order) {
            if(err) { reject(err) }
            resolve(order);
        });  
    });          
}

function promiseToGetOrderSummaryById(orderId){
    return new Promise(function(resolve, reject) {
        orderLineService.getOrderForSummary(orderId, function (err, orderSummary) {
            if(err) { reject(err) }
            resolve(orderSummary);
        });  
    });          
}

function promiseToGetCustomerEmployees(odataQuery){
    return new Promise(function(resolve, reject) {
        customerEmployeeService.getAll(odataQuery, function (err, customerEmployees) {
            if(err) { reject(err) }
            resolve(customerEmployees);
        });  
    });   
}

function promiseToGetBadges(odataQuery){
    return new Promise(function(resolve, reject) {
        badgeService.getAll(odataQuery, function (err, badges) {
            if(err) { reject(err) }
            resolve(badges);
        });  
    });   
} 

  
  
 
