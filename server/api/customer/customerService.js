'use strict';

(function (customerService) {
    
    //var seedData = require("./seedData");
    var mongoHelper = require('../../data/mongoHelper');
 
    customerService.getAll = function (next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.customers.find().toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };

    customerService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.customers.findOne({ _id: id }, next);                           
        });
    };

    customerService.create = function (customer, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.customers.insertOne(customer, next);      
        });
    };

    customerService.update = function (customer, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            customer._id = mongoHelper.normalizedId(customer._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.customers.findOneAndUpdate({_id:customer._id}, customer, {returnOriginal: false}, next);
        });
    };  

    customerService.remove = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);               
            db.customers.findOneAndDelete({_id:id}, next);
        });
    };
    
})(module.exports);