'use strict';

(function (customerService) {
    
    //var seedData = require("./seedData");
    var mongoHelper = require('../../data/mongoHelper');
 
    customerService.getAll = function (next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.customerEmployees.find().toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };

    customerService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.customerEmployees.findOne({ _id: id }, next);                           
        });
    };

    customerService.create = function (customerEmployee, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.customerEmployees.insertOne(customerEmployee, next);      
        });
    };

    customerService.update = function (customerEmployee, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            customerEmployee._id = mongoHelper.normalizedId(customerEmployee._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.customerEmployees.findOneAndUpdate({_id:customerEmployee._id}, customerEmployee, {returnOriginal: false}, next);
        });
    };  

    customerService.remove = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);               
            db.customerEmployees.findOneAndDelete({_id:id}, next);
        });
    };
    
})(module.exports);