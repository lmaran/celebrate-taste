'use strict';

var orderService = require('./orderService');
var orderLineService = require('../orderLine/orderLineService');
var menuService = require('../menu/menuService');
var orderValidator = require('./orderValidator');
var _ = require('lodash');
var helper = require('../../data/dateTimeHelper');   
var PDFDocument = require('pdfkit'); 

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

function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
