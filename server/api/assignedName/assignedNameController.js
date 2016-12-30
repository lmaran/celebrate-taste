'use strict';

var assignedNameService = require('./assignedNameService');
var assignedNameValidator = require('./assignedNameValidator');
var preferenceService = require('../preference/preferenceService');
var config = require('../../config/environment');
var emailService = require('../../data/emailService');


// ---------- OData ----------
exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "1000"; // if $top is not specified, return max. 1000 records
        
    assignedNameService.getAll(odataQuery, function (err, assignedNames) {
        if(err) { return handleError(res, err); }
        res.status(200).json(assignedNames);        
    });
};


// ---------- REST ----------
exports.create = function(req, res){
    assignedNameValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            var assignedName = req.body;
            
            // assignedName.isActive = true;
            assignedName.createBy = req.user.name;    
            assignedName.createdOn = new Date();              
            
            assignedNameService.create(assignedName, function (err, response) {
            if(err) { return handleError(res, err); }
            res.status(201).json(response.ops[0]);
        });           
        }
    });    
};

exports.getById = function (req, res) {
    assignedNameService.getById(req.params.id, function (err, assignedName) {
        if(err) { return handleError(res, err); }
        res.json(assignedName);
    });    
};

exports.update = function(req, res){
    var assignedName = req.body;
    assignedNameValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            assignedName.modifiedBy = req.user.name;    
            assignedName.modifiedOn = new Date(); 
            
            if(assignedName.askForNotification){
                var askForNotification = assignedName.askForNotification;
                delete assignedName.askForNotification;
            } 
            
            // update customer
            assignedNameService.update(assignedName, function (err, response) {
                if(err) { return handleError(res, err); }
                if (!response.value) {
                    res.sendStatus(404); // not found
                } else {
    
                    var originalCustomerName = response.value.name;
                    if(originalCustomerName !== assignedName.name){
                        
                        // update preferences
                        var filter2 = {employeeName: originalCustomerName};
                        var update2 = {$set: {
                            employeeName : assignedName.name
                        }};
                        preferenceService.updateMany(filter2, update2, function(err, response){
                            if(err) { return handleError(res, err); }
                        });                                             
                    } 

                    if(askForNotification){
                        // send an email with an activationLink
                        var from = assignedName.email;
                        var subject = 'Creare cont';
                        
                        var tpl = '';
                            tpl += '<p style="margin-bottom:30px;">Buna <strong>' + assignedName.name + '</strong>,</p>';
                            tpl += 'Adresa ta de email a fost inregistrata. ';
                            tpl += 'Din acest moment iti poti crea un cont in aplicatie.';
                            tpl += '<br>Si pentru ca totul sa fie cat mai simplu pentru tine, am creat link-ul de mai jos:';
                            tpl += '<p><a href="' + config.externalUrl + '/register?email=' + encodeURIComponent(assignedName.email) + '">Creaza cont</a></p>';
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
    assignedNameService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

exports.checkEmail = function (req, res) {
    var email = req.params.email;
       
    assignedNameService.getByValue('email', email, null, function (err, assignedName) {
        if(err) { return handleError(res, err); }

        if(assignedName){
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