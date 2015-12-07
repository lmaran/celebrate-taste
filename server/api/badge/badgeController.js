'use strict';

var badgeService = require('./badgeService');

exports.getAll = function (req, res) {
    badgeService.getAll(function (err, badges) {
        if(err) { return handleError(res, err); }
        res.status(200).json(badges);        
    });
};


exports.getById = function (req, res) {
    badgeService.getById(req.params.id, function (err, badge) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(badge);
    });    
};


exports.create = function(req, res){
    var badge = req.body;
    
    var isValid = validateBadge(req, res);
    if(!isValid) return;
    
    badgeService.create(badge, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });
};



exports.update = function(req, res){
    var badge = req.body;
    badgeService.update(badge, function (err, response) {
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
    badgeService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

function handleError(res, err) {
    return res.status(500).send(err);
};

function validateBadge(req, res){           
    // ---------------------------------
    req.sanitize('code').trim();   
    req.checkBody('code').notEmpty().withMessage('Acest camp este obligatoriu.');
    if(!req.validationErrors(true)['code'])
        req.checkBody('code').len(1,50).withMessage('Maxim 50 caractere.');
    
    // ---------------------------------        
    req.sanitize('name').trim();
    req.checkBody('name').notEmpty().withMessage('Acest camp este obligatoriu.');
    if(!req.validationErrors(true)['name'])
        req.checkBody('name').len(1,50).withMessage('Maxim 50 caractere.');
    
    // ---------------------------------                      
    var errors = req.validationErrors(true);  // mappedErrors 
    if (errors) {   
        res.status(400).send({ errors : errors }); // 400 - bad request
        return false;
    }
    return true;
}

 
    // req.validationErrors(true)        =>  (mappedErrors) - only the last validation msg / field is displayed 
    // optional()                        =>  skip validation if the field is empty
    // .optional({ checkFalsy: true })   =>  skip validation if the property is falsy (null, undefined etc)   
   
    //req.checkBody('code').len(1,50).isEmail().withMessage('Valid email required66');
    // .optional({ checkFalsy: true }).len().withMessage('Maxim 50 caractere.'); 
    
    // 400 - bad request => invalid type or value out of range (inteleg cererea dar nu accept formatul)
    // 422 - Unprocessable Entity => duplicate values (formatul e ok dar incearca alta valoare)