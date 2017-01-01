'use strict';

var customerEmployeeService = require('./customerEmployeeService');
var customerEmployeeValidator = require('./customerEmployeeValidator');
var preferenceService = require('../preference/preferenceService');
var badgeService = require('../badge/badgeService');
var config = require('../../config/environment');
var emailService = require('../../data/emailService');
var _ = require('lodash');


// ---------- OData ----------
exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "1000"; // if $top is not specified, return max. 1000 records
        
    customerEmployeeService.getAll(odataQuery, function (err, customerEmployees) {
        if(err) { return handleError(res, err); }
        // res.status(200).json(customerEmployees);        
        badgeService.getAll(odataQuery, function (err, badges) {
            if(err) { return handleError(res, err); }            

            let newCustomerEmployees = [];
            customerEmployees.forEach(function(customerEmployee){
                // find badge by name
                let badge = _.find(badges, function(b){
                    return normalize(b.ownerCode) == normalize(customerEmployee.name);
                });

                // if not found, search again by adjustedName
                if(!badge){
                    badge = _.find(badges, function(b){
                        return normalize(b.ownerCode) == normalize(customerEmployee.adjustedName);
                    });                    
                }

               newCustomerEmployees.push({
                    _id: customerEmployee._id,
                    name: customerEmployee.name,
                    adjustedName: customerEmployee.adjustedName,
                    isActive: customerEmployee.isActive,
                    email: customerEmployee.email,
                    badgeCode: badge && badge.code
               });
            });
            res.status(200).json(newCustomerEmployees);        
        });        
    });
};


// ---------- REST ----------
exports.create = function(req, res){
    customerEmployeeValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            var customerEmployee = req.body;
            
            customerEmployee.isActive = true;
            customerEmployee.createBy = req.user.name;    
            customerEmployee.createdOn = new Date();              
            
            customerEmployeeService.create(customerEmployee, function (err, response) {
            if(err) { return handleError(res, err); }
            res.status(201).json(response.ops[0]);
        });           
        }
    });    
};

exports.getById = function (req, res) {
    customerEmployeeService.getById(req.params.id, function (err, customerEmployee) {
        if(err) { return handleError(res, err); }
        res.json(customerEmployee);
    });    
};

exports.update = function(req, res){
    var customerEmployee = req.body;
    customerEmployeeValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            customerEmployee.modifiedBy = req.user.name;    
            customerEmployee.modifiedOn = new Date(); 
            
            if(customerEmployee.askForNotification){
                var askForNotification = customerEmployee.askForNotification;
                delete customerEmployee.askForNotification;
            } 
            
            // update customer
            customerEmployeeService.update(customerEmployee, function (err, response) {
                if(err) { return handleError(res, err); }
                if (!response.value) {
                    res.sendStatus(404); // not found
                } else {
    
                    var originalCustomerName = response.value.name;
                    if(originalCustomerName !== customerEmployee.name){
                        
                        // update preferences
                        var filter2 = {employeeName: originalCustomerName};
                        var update2 = {$set: {
                            employeeName : customerEmployee.name
                        }};
                        preferenceService.updateMany(filter2, update2, function(err, response){
                            if(err) { return handleError(res, err); }
                        });                                             
                    } 

                    if(askForNotification){
                        // send an email with an activationLink
                        var from = customerEmployee.email;
                        var subject = 'Creare cont';
                        
                        var tpl = '';
                            tpl += '<p style="margin-bottom:30px;">Buna <strong>' + customerEmployee.name + '</strong>,</p>';
                            tpl += 'Adresa ta de email a fost inregistrata. ';
                            tpl += 'Din acest moment iti poti crea un cont in aplicatie.';
                            tpl += '<br>Si pentru ca totul sa fie cat mai simplu pentru tine, am creat link-ul de mai jos:';
                            tpl += '<p><a href="' + config.externalUrl + '/register?email=' + encodeURIComponent(customerEmployee.email) + '">Creaza cont</a></p>';
                            tpl += '<p style="margin-top:30px">Acest email a fost generat automat.</p>';
                
                            emailService.sendEmail(from, subject, tpl).then(function (result) {
                                console.log(result);
                            }, function (err) {
                                console.log(err);
                                //handleError(res, err)
                            }); 
                    }                     
                    
                    res.sendStatus(200);
                }
            });
        }
    });
};

exports.remove = function(req, res){
    var id = req.params.id;
    customerEmployeeService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

exports.checkEmail = function (req, res) {
    var email = req.params.email;
       
    customerEmployeeService.getByValue('email', email, null, function (err, customerEmployee) {
        if(err) { return handleError(res, err); }

        if(customerEmployee){
            res.send(true);
        } else {
            res.send(false);
        }   
    }); 
};

// ---------- Helpers ----------
function handleError(res, err) {
    return res.status(500).send(err);
};

// todo: refactor as it is used in ordeLineController too
function normalize(str){
    if(!str) return undefined;
    return str.toLowerCase()
        .replace(/-/g , ' ') // replace dash with one space
        .replace(/ {2,}/g,' '); // replace multiple spaces with a single space
}