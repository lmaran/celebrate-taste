'use strict';

(function (menuService) {
    
    var mongoHelper = require('../../data/mongoHelper');
    var mongoService = require('../../data/mongoService');
    var collection = 'menus';
 
 
    // ---------- OData ----------
    menuService.getAll = function (req, next) {  
        var query = mongoService.getQuery(req);
        if(query.$sort === undefined) query.$sort = {menuDate: 1}; // sort by name (asc)
        mongoService.getAll(collection, query, next);
    };


    // ---------- CRUD ----------
    menuService.getById = function (id, next) {
        mongoService.getById(collection, id, next);
    };

    menuService.create = function (badge, next) {
        mongoService.create(collection, badge, next);
    };

    menuService.update = function (badge, next) {        
        mongoService.update(collection, badge, next);
    };  

    menuService.remove = function (id, next) {
        mongoService.remove(collection, id, next);
    };
    
    
    // ---------- Misc ----------    
    menuService.getByValue = function (field, value, id, next) {
        mongoService.getByValue(collection, field, value, id, next);
    }; 

    
    menuService.getTodaysMenu = function (today, next) { // today = "yyyy-mm-dd"
        //today = "2015-10-24"; // todo: remove it
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);            
            db.collection('menus').findOne({ menuDate: today }, next);                           
        });
    }; 
    
    menuService.getNextMenus = function (today, next) {  // today = "yyyy-mm-dd"   
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection('menus').find({"menuDate" : { $gt: today}}, {sort:'menuDate'}).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };
    
    menuService.getActiveMenus = function (today, next) {  // today = "yyyy-mm-dd"   
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.collection('menus').find({"menuDate" : { $gte: today}}, {sort:'menuDate'}).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };        
    
    menuService.getFromInterval = function (firstDay, lastDay, next) { // today = "yyyy-mm-dd"
        //today = "2015-10-24"; // todo: remove it
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null); 
            
            db.collection('menus').find({
                $and: [
                    {"menuDate" : { $gte: firstDay}},
                    {"menuDate" : { $lte: lastDay}}
                ]                  
            }).toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });                                      
        });
    };        


    
})(module.exports);