'use strict';

(function (dishService) {
    
    //var seedData = require("./seedData");
    var mongoHelper = require('../../data/mongoHelper');
 
    dishService.getAll = function (next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.dishes.find().toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };

    dishService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.dishes.findOne({ _id: id }, next);                           
        });
    };

    dishService.create = function (dish, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.dishes.insertOne(dish, next);      
        });
    };

    dishService.update = function (dish, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            dish._id = mongoHelper.normalizedId(dish._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.dishes.findOneAndUpdate({_id:dish._id}, dish, {returnOriginal: false}, next);
        });
    };  

    dishService.remove = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);               
            db.dishes.findOneAndDelete({_id:id}, next);
        });
    };
    
})(module.exports);