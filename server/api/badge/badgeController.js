'use strict';

var badgeService = require('./badgeService');
//var mongoService = require('../../data/mongoService');
var badgeValidator = require('./badgeValidator');

exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
        
    badgeService.getAll(odataQuery, function (err, badges) {
        if(err) { return handleError(res, err); }
        res.status(200).json(badges);        
    });
};


exports.getById = function (req, res) {
    badgeService.getById(req.params.id, function (err, badge) {
        if(err) { return handleError(res, err); }
        res.json(badge);
    });    
};


exports.create = function(req, res){
    var badge = req.body;
    badgeValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            badge.createBy = req.user.name;
            badge.createdOn = new Date();            
            
            badgeService.create(badge, function (err, response) {
                if (err) { return handleError(res, err); }
                res.location(req.originalUrl + response.insertedId);
                res.status(201).json(response.ops[0]);
            });           
        }
    });

};


exports.update = function(req, res){
    var badge = req.body;
    badgeValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            badge.modifiedBy = req.user.name;              
            badge.modifiedOn = new Date();          
            
            badgeService.update(badge, function (err, response) {
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
    badgeService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};


function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
