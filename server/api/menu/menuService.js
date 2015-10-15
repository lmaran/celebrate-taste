'use strict';

(function (menuService) {
    
    //var seedData = require("./seedData");
    var mongoHelper = require('../../data/mongoHelper');
 
    menuService.getAll = function (next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.menus.find().toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };

    menuService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.menus.findOne({ _id: id }, next);                           
        });
    };

    menuService.create = function (menu, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.menus.insertOne(menu, next);      
        });
    };

    menuService.update = function (menu, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            menu._id = mongoHelper.normalizedId(menu._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.menus.findOneAndUpdate({_id:menu._id}, menu, {returnOriginal: false}, next);
        });
    };  

    menuService.remove = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);               
            db.menus.findOneAndDelete({_id:id}, next);
        });
    };
    
})(module.exports);