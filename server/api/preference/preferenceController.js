'use strict';

var preferenceService = require('./preferenceService');
var preferenceValidator = require('./preferenceValidator');

exports.getAll = function (req, res) {
    preferenceService.getAll(function (err, preferences) {
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


exports.create = function(req, res){
    var preference = req.body;
    preferenceValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
             preferenceService.create(preference, function (err, response) {
                if(err) { return handleError(res, err); }
                res.status(201).json(response.ops[0]);
            });           
        }
    });

};


exports.update = function(req, res){
    var preference = req.body;
    preferenceValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
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


  
  
 
