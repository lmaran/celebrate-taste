'use strict';

var preferenceService = require('./preferenceService');
var preferenceValidator = require('./preferenceValidator');

// ---------- OData ----------
exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "1000"; // if $top is not specified, return max. 1000 records
       
    preferenceService.getAll(odataQuery, function (err, preferences) {
        if(err) { return handleError(res, err); }
        res.status(200).json(preferences);        
    });
};


// ---------- REST ----------
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

exports.getById = function (req, res) {
    preferenceService.getById(req.params.id, function (err, preference) {
        if(err) { return handleError(res, err); }
        res.json(preference);
    });    
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
            
            if(preference.option1)
                preference.option1 = preference.option1.toUpperCase();
            if(preference.option2)
                preference.option2 = preference.option2.toUpperCase();                       
            
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


// ---------- RPC ----------
exports.createMany = function(req, res){
    var preferences = req.body;
    
    preferences.forEach(function(preference) {
        preference.createBy = req.user.name;    
        preference.createdOn = new Date();        
    });

    preferenceService.createMany(preferences, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });           
};

// out: ["2015-12-04", "2015-12-05", "2015-12-06"]
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

exports.saveMyPreferences = function(req, res){ 
    var myPreference = req.body;
    
    if(myPreference.preferenceId){ // update
        preferenceService.getById(myPreference.preferenceId, function (err, preference) {
            if(err) { return handleError(res, err); }

            preference.modifiedBy = req.user.name;    
            preference.modifiedOn = new Date();
            
            preference["option" + myPreference.category] = myPreference.selectedOption;                     
            
            preferenceService.update(preference, function (err, response) {
                if(err) { return handleError(res, err); }
                if (!response.value) {
                    res.sendStatus(404); // not found
                } else {
                    res.sendStatus(200);
                }
            });            
              
        });         
    } else {  // create
        var preference = {};
        preference.employeeName = req.user.name;
        preference.date = myPreference.menuDate;
        preference["option" + myPreference.category] = myPreference.selectedOption;
        preference.createBy = req.user.name;    
        preference.createdOn = new Date(); 
                
        preferenceService.create(preference, function (err, response) {
            if(err) { return handleError(res, err); }
            res.status(201).json(response.ops[0]);
        });                 
    }

};


// ---------- Helpers ----------
function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
