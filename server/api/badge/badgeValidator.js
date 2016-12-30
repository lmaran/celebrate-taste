'use strict';

(function (badgeValidator) {
    
    var badgeService = require('./badgeService');
    var async = require('async');
    var validator = require('validator');  
    var _ = require('lodash');  
    
    // requiredAndUnique
    badgeValidator.badgeOwnerCode = function(req, res, cbResult){
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
                badgeService.getByValue('badgeOwnerCode', fieldVal, req.body._id, function (err, badge) {
                    if(err) { return handleError(res, err); }
                    if (badge) { 
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
    badgeValidator.employeeId = function(req, res, cbResult){
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
    badgeValidator.all = function(req, res, cbResult){       
        async.parallel([
            function(cb){
               badgeValidator.badgeOwnerCode(req, res, cb);
            },
            function(cb){
               badgeValidator.employeeId(req, res, cb);
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