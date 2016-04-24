'use strict';

(function (orderLineService) {

    var mongoHelper = require('../../data/mongoHelper');
    var mongoService = require('../../data/mongoService');
    var collection = 'orderLines';
    var _ = require('lodash');
    
    
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
    
    orderLineService.getDeliverySummary = function (orderId, eatSeries, next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).aggregate([
                { $match: { orderId:orderId, eatSeries:eatSeries } },
                { $group: {
                    _id: {
                        opt1: "$option1",
                        opt2: "$option2",
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }},
                { $project: {
                    _id:0, 
                    opt1:"$_id.opt1", 
                    opt2:"$_id.opt2", 
                    status:"$_id.status", 
                    count:"$count"
                }}
            
            ]).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, formatSummary(orderId, eatSeries, docs));                 
            });
        });
    }; 
    
    orderLineService.getOrderForSummary = function (orderId, next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection)
                .find({orderId:orderId}, {sort:{employeeName:1}})
                .project({_id:0, eatSeries:1, employeeName:1, badgeCode:1, status:1, deliveryMode:1})
                .toArray(function (err, docs) {
                    if (err) return next(err, null);
                    return next(null, docs);                 
            });
        });
    };     
    
    function formatSummary(orderId, eatSeries, deliverySummary){
        var servings = {delivered:0, remaining:0}; // ((portii pe persoane)
        var options = [];
        
        deliverySummary.forEach(function(item) {
            if(item.status === 'completed'){
                servings.delivered += item.count;
            } else { // 'open'
                servings.remaining += item.count;
            }
            
            // option1
            var option1 = _.find(options, {key:item.opt1});
            if(option1){ // update existing
                if(item.status === 'completed'){
                    option1.value.delivered += item.count
                } else { // 'open'
                    option1.value.remaining += item.count
                }                
            } else { // insert new
                if(item.opt1){
                    if(item.status === 'completed'){
                        options.push({key:item.opt1, value:{delivered:item.count, remaining:0}});
                    } else { // 'open'
                        options.push({key:item.opt1, value:{delivered:0, remaining:item.count}});
                    }  
                }                
            }  
            
            // option2
            var option2 = _.find(options, {key:item.opt2});
            if(option2){ // update existing
                if(item.status === 'completed'){
                    option2.value.delivered += item.count
                } else { // 'open'
                    option2.value.remaining += item.count
                }                
            } else { // insert new
                if(item.opt1){
                    if(item.status === 'completed'){
                        options.push({key:item.opt2, value:{delivered:item.count, remaining:0}});
                    } else { // 'open'
                        options.push({key:item.opt2, value:{delivered:0, remaining:item.count}});
                    }   
                }
            }  
        });
        
        // add a 'total' field
        servings.total = servings.delivered + servings.remaining;
        
        options.forEach(function(option){
            option.value.total = option.value.delivered + option.value.remaining;
        });
        
        var newDeliverySummary = {
            servings: servings,
            options: _.sortBy(options, 'key')
        };
        
        return(newDeliverySummary);
        
        // output:
        // {
        //     servings: {
        //         delivered: 11,
        //         remaining: 137,
        //         total: 148
        //     },
        //     options: [
        //         {
        //             key: "A",
        //             value: {
        //                 delivered: 2,
        //                 remaining: 61,
        //                 total: 63
        //             }
        //         },
        //         {
        //             key: "B",
        //             value: {
        //                 delivered: 9,
        //                 remaining: 75,
        //                 total: 84
        //             }
        //         },
        //         {
        //             key: "C",
        //             value: {
        //                 delivered: 3,
        //                 remaining: 56,
        //                 total: 59
        //             }
        //         },
        //         {
        //             key: "D",
        //             value: {
        //                 delivered: 8,
        //                 remaining: 80,
        //                 total: 88
        //             }
        //         }
        //     ]
        // }          
    }     
    
})(module.exports);