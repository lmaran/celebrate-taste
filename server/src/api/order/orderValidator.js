'use strict';

(function (orderValidator) {
    
    var orderService = require('./orderService');
    var async = require('async');
    var validator = require('validator');  
    var _ = require('lodash');  
    
    
    // "code" validation
    orderValidator.code = function(req, res, cbResult){
        var fieldVal = validator.trim(req.body.code);     
        async.series([
            function(cb){
                if(!validator.isLength(fieldVal, 1)){
                    cb("Acest camp este obligatoriu.");
                }
                else if(!validator.isLength(fieldVal, 1, 50)){
                    cb("Maxim 50 caractere.");
                }
                else cb(null, 'checkNext');  
            },
            function(cb){
                orderService.getByValue('code', fieldVal, req.body._id, function (err, order) {                    
                    if(err) { return handleError(res, err); }
                    if (order) { 
                        cb("Exista deja o inregistrare cu aceasta valoare."); 
                    }
                    else cb(null, 'checkNext');      
                });  
            }        
        ],
        function(err, results){            
            if(err == null) // no validation errors
                cbResult(null, null);
            else    
                cbResult(null, {field:'code', msg: err});
        });
    };  
    
    
    // "name" validation
    orderValidator.name = function(req, res, cbResult){
        var fieldVal = validator.trim(req.body.name);     
        async.series([
            function(cb){
                if(!validator.isLength(fieldVal, 1)){
                    cb("Acest camp este obligatoriu.");
                }
                else if(!validator.isLength(fieldVal, 1, 50)){
                    cb("Maxim 50 caractere.");
                }
                else cb(null, 'checkNext'); 
            },
            function(cb){
                orderService.getByValue('name', fieldVal, req.body._id, function (err, order) {
                    if(err) { return handleError(res, err); }
                    if (order) { 
                        cb("Exista deja o inregistrare cu aceasta valoare."); 
                    }
                    else cb(null, 'checkNext');      
                });  
            }        
        ],
        function(err, results){
            if(err == null) 
                cbResult(null, null); // return null if no error
            else    
                cbResult(null, {field:'name', msg: err});
        });
    };    
    
      
    // all validations
    orderValidator.all = function(req, res, cbResult){       
        async.parallel([
            function(cb){
               orderValidator.code(req, res, cb)
            },
            function(cb){
               orderValidator.name(req, res, cb)
            }         
        ],
        function (err, results) {
            results = _.compact(results); // remove null elements from array
            if(results.length == 0) results = null; // return null if no errors
            cbResult(results);        
        }); 
    }
    
    
    function handleError(res, err) {
        return res.status(500).send(err);
    };
    
})(module.exports);