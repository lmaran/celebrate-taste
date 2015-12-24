'use strict';

(function (orderService) {
    
    //var seedData = require("./seedData");
    var mongoHelper = require('../../data/mongoHelper');
 
    orderService.getAll = function (next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.orders.find({}, {sort:'name'}).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };

    orderService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.orders.findOne({ _id: id }, next);                           
        });
    };
    
    orderService.getByValue = function (field, value, id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            
            // construct the query: http://stackoverflow.com/a/17039560/2726725
            var query = {};
            
            // escape special ch.: http://stackoverflow.com/a/8882749/2726725
            // add an "\" in front of each special ch. E.g.: . ? * + ^ $ ( ) [ ] | -         
            value = value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
                         
            // search case insensitive: https://xuguoming.wordpress.com/2015/02/11/using-variable-regex-with-mongodb-query-in-node-js/
            // the "start with" (^) character is important in order to hit the index"
            query[field] = new RegExp('^' + value + '$', 'i'); 
            
            // for update we have to exclude the existing document
            if(id) query._id = {$ne: mongoHelper.normalizedId(id)}; // {name: /^John$/i, _id: {$ne:'93874502347652345'}}  
            
            db.orders.findOne(query, next);                           
        });
    };    

    orderService.create = function (order, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.orders.insertOne(order, next);      
        });
    };

    orderService.update = function (order, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            order._id = mongoHelper.normalizedId(order._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.orders.findOneAndUpdate({_id:order._id}, order, {returnOriginal: false}, next);
        });
    };  

    orderService.remove = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);               
            db.orders.findOneAndDelete({_id:id}, next);
        });
    };
    
})(module.exports);