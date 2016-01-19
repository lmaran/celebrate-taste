'use strict';

var preferenceService = require('./preferenceService');
var preferenceValidator = require('./preferenceValidator');
//var helper = require('../../data/dateTimeHelper');

exports.getAll = function (req, res) {
    preferenceService.getAll(req, function (err, preferences) {
        if(err) { return handleError(res, err); }
        res.status(200).json(preferences);        
    });
};


exports.getById = function (req, res) {
    preferenceService.getById(req.params.id, function (err, preference) {
        if(err) { return handleError(res, err); }
        res.json(preference);
    });    
};


// output: ["2015-12-04", "2015-12-05", "2015-12-06"]
exports.getNextDates = function (req, res) {
    var todayStr = req.query.today;// || helper.getStringFromDate(new Date()); // "2015-12-03"
    preferenceService.getNextDates(todayStr, function (err, dates) {
        if(err) { return handleError(res, err); }
        var result = [];
        if(dates.length > 0)
            result = dates[0].nextDates;
        res.json(result); 
    });    
};



exports.create = function(req, res){
    var preference = req.body;
    preferenceValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            preference.createBy = req.user.name;    
            preference.createdOn = new Date();  
                        
            preferenceService.create(preference, function (err, response) {
                if(err) { return handleError(res, err); }
                res.status(201).json(response.ops[0]);
            });           
        }
    });

};

exports.createMany = function(req, res){
    var preferences = req.body;
    
    preferences.forEach(function(preference) {
        preference.createBy = req.user.name;    
        preference.createdOn = new Date();        
    });
    
    
       
    // preferenceValidator.all(req, res, function(errors){
    //     if(errors){
    //         res.status(400).send({ errors : errors }); // 400 - bad request
    //     }
    //     else{
             preferenceService.createMany(preferences, function (err, response) {
                if(err) { return handleError(res, err); }
                res.status(201).json(response.ops[0]);
            });           
    //     }
    // });

};


exports.update = function(req, res){
    var preference = req.body;
    preferenceValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            preference.modifiedBy = req.user.name;    
            preference.modifiedOn = new Date();             
            
            preferenceService.update(preference, function (err, response) {
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
    var id = req.params.id;
    preferenceService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};


function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
