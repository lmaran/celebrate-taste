'use strict';

(function (orderLineService) {

    var mongoHelper = require('../../data/mongoHelper');
    var mongoService = require('../../data/mongoService');
    var collection = 'orderLines';
    
    
    // ---------- OData ----------
    orderLineService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {eatSeries: 1, employeeName:1};
        mongoService.getAll(collection, query, next);
    };      
    
    
    // ---------- REST ----------
    orderLineService.create = function (orderLine, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).insertOne(orderLine, next);      
        });
    };

    orderLineService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.collection(collection).findOne({ _id: id }, next);                           
        });
    };
    
    orderLineService.update = function (orderLine, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            orderLine._id = mongoHelper.normalizedId(orderLine._id);
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
    
    
    // ---------- RPC ----------
    orderLineService.getByOrderIdAndSeries = function (orderId, eatSeries, next) {     
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).find({orderId:orderId, eatSeries: eatSeries}, {sort:{employeeName:1}}).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
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
    
    orderLineService.getSummary = function (orderId, next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).aggregate([
                { $match: { orderId:orderId } },
                { $group: {
                    _id: {orderDate: '$orderDate', eatSeries:'$eatSeries', option1:'$option1'},
                    count1: { $sum: 1 },
                    options2:{$push:'$option2'}
                }},
                { $unwind:'$options2'},
                { $group: {
                    _id: {orderDate: '$_id.orderDate', eatSeries:'$_id.eatSeries', option2:'$options2'},
                    count2: { $sum: 1},
                    options1:{$push:{value:'$_id.option1', count:'$count1'}}
                }},
                { $unwind:'$options1'},
                { $group:{
                    _id:'$_id.eatSeries',
                    orderDate: {$max: '$_id.orderDate'},
                    eatSeries: {$max: '$_id.eatSeries'},
                    options1:{$addToSet:'$options1'},
                    options2:{$addToSet:{value:'$_id.option2', count:'$count2'}}
                    
                }},
                { $project: { _id:0, orderDate: '$orderDate', eatSeries:'$eatSeries', options: { $setUnion: [ "$options1", "$options2" ] }} },
                { $sort:{ eatSeries:1 }}

            ]).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };
    
    orderLineService.getEatSeriesList = function (orderId, next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).aggregate([
                { $match: { orderId:orderId } },
                { $group: {_id:{eatSeries:'$eatSeries'} } },	
                { $project: {_id:0, eatSeries:'$_id.eatSeries'} },
                { $sort: {'eatSeries':1} }
            ]).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
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
    
})(module.exports);