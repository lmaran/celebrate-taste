'use strict';

(function (teamService) {
    
    //var seedData = require("./seedData");
    var mongoHelper = require('../../data/mongoHelper');
 
    teamService.getAll = function (next) {      
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.teams.find().toArray(function (err, docs) {
                if (err) return next(err, null);
                return next(null, docs);                 
            });
        });
    };

    teamService.getById = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);
            db.teams.findOne({ _id: id }, next);                           
        });
    };
    
    teamService.getByValue = function (field, value, id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            var query = {};
            query[field] = value; // http://stackoverflow.com/a/17039560/2726725
            if(id) // for update we have to exclude the existing document
                query._id = {$ne: mongoHelper.normalizedId(id)}; //{name:'ssss', _id: {$ne:'93874502347652345'}}  
            db.teams.findOne(query, next);                           
        });
    };    

    teamService.create = function (team, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            db.teams.insertOne(team, next);      
        });
    };

    teamService.update = function (team, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            team._id = mongoHelper.normalizedId(team._id);
            // returnOriginal: (default:true) Set to false if you want to return the modified object rather than the original
            db.teams.findOneAndUpdate({_id:team._id}, team, {returnOriginal: false}, next);
        });
    };  

    teamService.remove = function (id, next) {
        mongoHelper.getDb(function (err, db) {
            if (err) return next(err, null);
            id = mongoHelper.normalizedId(id);               
            db.teams.findOneAndDelete({_id:id}, next);
        });
    };
    
})(module.exports);