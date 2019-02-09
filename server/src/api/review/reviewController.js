'use strict';

var reviewService = require('./reviewService');

// ---------- OData ----------
exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "1000"; // if $top is not specified, return max. 1000 records
       
    reviewService.getAll(odataQuery, function (err, reviews) {
        if(err) { return handleError(res, err); }
        res.status(200).json(reviews);        
    });
};


// ---------- REST ----------


// ---------- RPC ----------
exports.saveMyReview = function(req, res){ 
    let myReview = req.body;
    myReview.createdBy = req.user.name;    
    myReview.createdOn = new Date(); 
            
    reviewService.updateOrInsert(myReview, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(201);
    });                 
};

exports.deleteMyReview = function(req, res){ 
    let dishId = req.params.dishId;
    let menuDate = req.params.menuDate;
            
    reviewService.deleteReview(dishId, menuDate, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(201);
    });                 
};


// ---------- Helpers ----------
function handleError(res, err) {
    return res.status(500).send(err);
};


  
  
 
