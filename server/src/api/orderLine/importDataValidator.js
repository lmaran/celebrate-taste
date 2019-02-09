'use strict';

(function (importDataValidator) {
    
    //var orderLineService = require('./orderLineService');
    var customerEmployeeService = require('../customerEmployee/customerEmployeeService');
    var async = require('async');
    var validator = require('validator');  
    var _ = require('lodash');  
    
    
    // "employeeName" validation
    importDataValidator.employeesName = function(req, res, cbResult){
        var fieldVal = validator.trim(req.body.employeesName); // array of names 
        async.series([
            function(cb){
                if(!validator.isLength(fieldVal, 1)){
                    cb("Acest camp este obligatoriu.");
                }
                // else if(!validator.isLength(fieldVal, 1, 50)){
                //     cb("Maxim 50 caractere.");
                // }
                else cb(null, 'checkNext');  
            },
            function(cb){
                // main
                
                // orderLineService.getByValue(req.body.orderId, 'employeeName', fieldVal, req.body._id, function (err, orderLine) {                    
                //     if(err) { return handleError(res, err); }
                //     if (orderLine) { 
                //         cb("Exista deja o inregistrare cu aceasta valoare."); 
                //     }
                //     else cb(null, 'checkNext');      
                // }); 
                
                    customerEmployeeService.getAll(req, function (err, customerEmployees) {
                        if(err) { return handleError(res, err); }
                        // if (orderLine) { 
                        //     cb("Exista deja o inregistrare cu aceasta valoare."); 
                        // }
                        // else 
                            cb(null, 'checkNext');      
                    });
            }        
        ],
        function(err, results){            
            if(err == null) // no validation errors
                cbResult(null, null);
            else    
                cbResult(null, {field:'employeeName', msg: err});
        });
    };  
    
    
    // "eatSeries" validation
    importDataValidator.eatSeries = function(req, res, cbResult){
        var fieldVal = validator.trim(req.body.eatSeries);     
        async.series([
            function(cb){
                if(!validator.isLength(fieldVal, 1)){
                    cb("Acest camp este obligatoriu.");
                }
                else if(!validator.isLength(fieldVal, 1, 50)){
                    cb("Maxim 50 caractere.");
                }
                else cb(null, 'checkNext'); 
            }       
        ],
        function(err, results){
            if(err == null) 
                cbResult(null, null); // return null if no error
            else    
                cbResult(null, {field:'eatSeries', msg: err});
        });
    };    
    
      
    // all validations
    importDataValidator.all = function(req, res, cbResult){       
        // async.parallel([
        //     function(cb){
        //        importDataValidator.employeesName(req, res, cb)
        //     },
        //     function(cb){
        //        importDataValidator.eatSeries(req, res, cb)
        //     }         
        // ],
        // function (err, results) {
        //     results = _.compact(results); // remove null elements from array
        //     if(results.length == 0) results = null; // return null if no errors
        //     cbResult(results);        
        // });
        
        cbResult(null); // no err
    }
    
    
    function handleError(res, err) {
        return res.status(500).send(err);
    };
    
})(module.exports);