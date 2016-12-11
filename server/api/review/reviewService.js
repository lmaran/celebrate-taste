'use strict';

(function (reviewService) {
    
    var mongoHelper = require('../../data/mongoHelper');
    var mongoService = require('../../data/mongoService');
    var collection = 'reviews';
 
 
    // ---------- OData ----------
    reviewService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {menuDate: -1};
        mongoService.getAll(collection, query, next);
    };


    // ---------- REST ----------
    
    
    // ---------- RPC ----------
    reviewService.updateOrInsert = function (review, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            let query = {menuDate: review.menuDate, dishId: review.dishId};
            db.collection(collection).update(query, review, {upsert:true}, next);
        });
    }; 

    reviewService.getByEmployeeAndDate = function (employeeName, dateStr, next) { 
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).find({menuDate: dateStr, createdBy: employeeName}).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    }; 

    reviewService.deleteReview = function (dishId, menuDate, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);          
            db.collection(collection).findOneAndDelete({dishId:dishId, menuDate:menuDate}, next);
        });
    };          

})(module.exports);