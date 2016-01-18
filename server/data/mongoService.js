'use strict';

(function (mongoService) {
    
    //var seedData = require("./seedData");
    var mongoHelper = require('./mongoHelper');
    
    mongoService.getQuery = function(req){
        //console.log(req.params);
        var parser = require("odata-parser");
        var queryTransform = require("./queryTransform.js");
        var querystring = require("querystring"); // internal node module    
        
        var queryOptions = { $filter: {}};

        if(req.query){
            var query = req.query;
            
            // lm: select only odata parameters
            var fixedQS = {};
            if (query.$) fixedQS.$ = query.$;
            if (query.$expand) fixedQS.$expand = query.$expand;
            if (query.$filter) fixedQS.$filter = query.$filter;
            if (query.$format) fixedQS.$format = query.$format;
            if (query.$inlinecount) fixedQS.$inlinecount = query.$inlinecount;
            if (query.$select) fixedQS.$select = query.$select;
            if (query.$skip) fixedQS.$skip = query.$skip;
            if (query.$top) fixedQS.$top = query.$top;
            if (query.$orderby) fixedQS.$orderby = query.$orderby;


            var encodedQS = decodeURIComponent(querystring.stringify(fixedQS));
            if (encodedQS) {
                queryOptions = queryTransform(parser.parse(encodedQS));
            }
            if (query.$count) {
                queryOptions.$inlinecount = true;
            }
            
            // console.log('-----------------------------------------------------------------Initial query');
            // console.log(query);
            // console.log('-----------------------------------------------------------------Initial');
            // console.log(fixedQS);
            // console.log('-----------------------------------------------------------------Stringify');
            // console.log(querystring.stringify(fixedQS));
            // console.log('-----------------------------------------------------------------Decoded');
            // console.log(encodedQS);
            // console.log('-----------------------------------------------------------------Parsed');
            // console.log(JSON.stringify(parser.parse(encodedQS), null, 4));
            // console.log('-----------------------------------------------------------------Transformed');
            // console.log(queryOptions.$filter);
            
        }

        //queryOptions.collection = req.params.collection;

        if (req.params.$count) {
            queryOptions.$count = true;
        }

        // if (req.params.id) {
        //     req.params.id = req.params.id.replace(/\"/g, "").replace(/'/g, "");
        //     queryOptions.$filter = { _id: req.params.id};
        // } 
        
        return queryOptions;         
    }
 
    mongoService.getAll = function (collection, query, next) {  
        // https://github.com/pofider/node-simple-odata-server/blob/master/lib/mongoAdapter.js
        mongoHelper.getDb(function (err, db) {
            // var Logger = require('mongodb').Logger;
            // Logger.setLevel('debug');
            // //Logger.filter('class', ['Db']);
            
            //console.log(db.db.logger);
            
            if (err) return next(err, null);
            
            
            //db.collection('badges').find().explain();
            
            //var query = getQuery();
             
            var qr = db.collection(collection).find(query.$filter, query.$select || {});

            if (query.$sort) {
                qr = qr.sort(query.$sort);
            }
            if (query.$skip) {
                qr = qr.skip(query.$skip);
            }
            if (query.$limit) {
                qr = qr.limit(query.$limit);
            }
 
            // count
            if (query.$count) {
                return qr.count(next);
            }
  
            // result
            if (!query.$inlinecount) {
                return qr.toArray(next);
            }

            // count + result
            qr.toArray(function(err, res) {
                if (err)
                    return next(err);

                db.collection(collection).find(query.$filter).count(function(err, c) {
                    if (err)
                        return next(err);
                    
                    next(null, {
                        count: c,
                        value: res
                    });
                    

                });
            });            

        });
    };
    
    mongoService.getByValue = function (collection, field, value, id, next) {
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
            
            db.collection(collection).findOne(query, next);                           
        });
    };    

    // create
    mongoService.create = function (collection, obj, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(collection).insertOne(obj, next);      
        });
    };
    
    // read
    mongoService.getById = function (collection, id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.collection(collection).findOne({ _id: id }, next);                           
        });
    };    

    // update
    mongoService.update = function (collection, obj, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            obj._id = mongoHelper.normalizedId(obj._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.collection(collection).findOneAndUpdate({_id:obj._id}, obj, {returnOriginal: false}, next);
        });
    };  

    // delete
    mongoService.remove = function (collection, id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);               
            db.collection(collection).findOneAndDelete({_id:id}, next);
        });
    };
    
})(module.exports);