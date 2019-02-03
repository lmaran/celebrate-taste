'use strict';

(function (dishService) {
    
    var mongoService = require('../../data/mongoService');
    var mongoHelper = require('../../data/mongoHelper');
    var collection = 'dishes';
    var imageCollection = 'dishImages';
 
 
    // ---------- OData ----------
    dishService.getAll = function (odataQuery, next) {  
        var query = mongoService.getQuery(odataQuery);
        if(query.$sort === undefined) query.$sort = {category: 1, name: 1};
        mongoService.getAll(collection, query, next);
    };


    // ---------- REST ----------
    dishService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    dishService.create = function (dish, next) {
        mongoService.create(collection, dish, next);
    };

    dishService.update = function (dish, next) {        
        mongoService.update(collection, dish, next);
    };  

    dishService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- RPC ----------    
    dishService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    };  

    dishService.createImageEntity = function (dishImage, next) {
        mongoService.create(imageCollection, dishImage, next);
    };

    dishService.getImageEntity = function (blobName, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection(imageCollection).findOne({blobName: blobName}, next);                           
        });        
    };

    dishService.updateImageEntity = function (dishImage, next) {        
        mongoService.update(imageCollection, dishImage, next);
    };              
    
})(module.exports);