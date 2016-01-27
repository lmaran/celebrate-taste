'use strict';

(function (orderLineService) {
    
    //var seedData = require("./seedData");
    var mongoHelper = require('../../../data/mongoHelper');
    var collection = 'orderLines';
 
    orderLineService.getAll = function (orderId, next) {     
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).find({orderId:orderId}, {sort:{eatSeries:1, employeeName:1}}).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };
    
    orderLineService.getByOrderIdAndSeries = function (orderId, eatSeries, next) {     
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).find({orderId:orderId, eatSeries: eatSeries}, {sort:{employeeName:1}}).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };    

    orderLineService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.collection(collection).findOne({ _id: id }, next);                           
        });
    };
    
    orderLineService.getByValue = function (orderId, field, value, id, next) {
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
            query.orderId = orderId;
            
            db.collection(collection).findOne(query, next);                           
        });
    };    

    orderLineService.create = function (orderLine, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).insertOne(orderLine, next);      
        });
    };

    orderLineService.update = function (orderLine, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            orderLine._id = mongoHelper.normalizedId(orderLine._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.collection(collection).findOneAndUpdate({_id:orderLine._id}, orderLine, {returnOriginal: false}, next);
        });
    };  

    orderLineService.remove = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);               
            db.collection(collection).findOneAndDelete({_id:id}, next);
        });
    };
    
    orderLineService.createMany = function (orderLines, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).insertMany(orderLines, next);      
        });
    }; 
    
    orderLineService.removeMany = function (id, next) { 
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null); 
            db.collection(collection).deleteMany({orderId:id}, next);
        });
    };       
    
})(module.exports);