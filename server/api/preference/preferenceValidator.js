'use strict';

(function (preferenceValidator) {
    
    var preferenceService = require('./preferenceService');
    var async = require('async');
    var validator = require('validator');  
    var _ = require('lodash');  
    
    
    // "code" validation
    preferenceValidator.code = function(req, res, cbResult){
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
                preferenceService.getByValue('code', fieldVal, req.body._id, function (err, preference) {                    
                    if(err) { return handleError(res, err); }
                    if (preference) { 
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
    preferenceValidator.name = function(req, res, cbResult){
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
                preferenceService.getByValue('name', fieldVal, req.body._id, function (err, preference) {
                    if(err) { return handleError(res, err); }
                    if (preference) { 
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
    preferenceValidator.all = function(req, res, cbResult){       
        async.parallel([
            function(cb){
               preferenceValidator.code(req, res, cb)
            },
            function(cb){
               preferenceValidator.name(req, res, cb)
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