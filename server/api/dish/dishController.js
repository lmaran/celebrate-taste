'use strict';

var dishService = require('./dishService');

exports.getAll = function (req, res) {
    dishService.getAll(req, function (err, dishes) {
        if(err) { return handleError(res, err); }
        res.status(200).json(dishes);        
    });
};


exports.getById = function (req, res) {
    dishService.getById(req.params.id, function (err, dish) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(dish);
    });    
};


exports.create = function(req, res){
    var dish = req.body;
    dishService.create(dish, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });
};


exports.update = function(req, res){
    var dish = req.body;
    dishService.update(dish, function (err, response) {
        if(err) { return handleError(res, err); }
        if (!response.value) {
            res.sendStatus(404); // not found
        } else {
            res.sendStatus(200);
        }
    });
};


exports.remove = function(req, res){
    var id = req.params.id;
    dishService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

function handleError(res, err) {
    return res.status(500).send(err);
};