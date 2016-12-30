'use strict';

(function (assignedNameValidator) {
    
    var assignedNameService = require('./assignedNameService');
    var async = require('async');
    var validator = require('validator');  
    var _ = require('lodash');  
    
    // requiredAndUnique
    assignedNameValidator.badgeOwnerCode = function(req, res, cbResult){
        var fieldVal = req.body.badgeOwnerCode;     
        async.series([
            function(cb){
                if(fieldVal === undefined || fieldVal === ''){
                    cb("Acest camp este obligatoriu.");
                }
                else if(fieldVal && fieldVal.length > 50){
                    cb("Maxim 50 caractere.");
                }
                else cb(null, 'checkNext'); 
            },
            function(cb){
                assignedNameService.getByValue('badgeOwnerCode', fieldVal, req.body._id, function (err, assignedName) {
                    if(err) { return handleError(res, err); }
                    if (assignedName) { 
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
                cbResult(null, {field:'badgeOwnerCode', msg: err});
        });
    };   

    // required
    assignedNameValidator.employeeId = function(req, res, cbResult){
        var fieldVal = req.body.employeeId;     
        async.series([
            function(cb){
                if(fieldVal === undefined || fieldVal === ''){
                    cb("Acest camp este obligatoriu.");
                }
                else if(fieldVal && fieldVal.length > 50){
                    cb("Maxim 50 caractere.");
                }
                else cb(null, 'checkNext'); 
            }       
        ],
        function(err, results){
            if(err == null) 
                cbResult(null, null); // return null if no error
            else    
                cbResult(null, {field:'employeeId', msg: err});
        });
    };            
          
    // all validations
    assignedNameValidator.all = function(req, res, cbResult){       
        async.parallel([
            function(cb){
               assignedNameValidator.badgeOwnerCode(req, res, cb);
            },
            function(cb){
               assignedNameValidator.employeeId(req, res, cb);
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