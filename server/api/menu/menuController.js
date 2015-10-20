'use strict';

var menuService = require('./menuService');

exports.getAll = function (req, res) {
    menuService.getAll(function (err, menus) {
        if(err) { return handleError(res, err); }
        res.status(200).json(menus);        
    });
};


exports.getById = function (req, res) {
    menuService.getById(req.params.id, function (err, menu) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(menu);
    });    
};

exports.getTodaysMenu = function (req, res) {
    menuService.getTodaysMenu(req.params.today, function (err, menu) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(menu);
    });    
};

exports.create = function(req, res){
    var menu = req.body;
    menuService.create(menu, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });
};


exports.update = function(req, res){
    var menu = req.body;
    menuService.update(menu, function (err, response) {
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
    menuService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

function handleError(res, err) {
    return res.status(500).send(err);
};