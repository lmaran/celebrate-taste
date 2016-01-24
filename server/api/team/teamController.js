'use strict';

var teamService = require('./teamService');
var teamValidator = require('./teamValidator');

exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
        
    teamService.getAll(odataQuery, function (err, teams) {
        if(err) { return handleError(res, err); }
        res.status(200).json(teams);        
    });
};


exports.getById = function (req, res) {
    teamService.getById(req.params.id, function (err, team) {
        if(err) { return handleError(res, err); }
        res.json(team);
    });    
};


exports.create = function(req, res){
    var team = req.body;
    teamValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            team.createBy = req.user.name;    
            team.createdOn = new Date();             
            
            teamService.create(team, function (err, response) {
                if(err) { return handleError(res, err); }
                res.status(201).json(response.ops[0]);
            });           
        }
    });

};


exports.update = function(req, res){
    var team = req.body;
    teamValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            team.modifiedBy = req.user.name;    
            team.modifiedOn = new Date();          
            
            teamService.update(team, function (err, response) {
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
    teamService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};


function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
