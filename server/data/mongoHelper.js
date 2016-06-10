(function(mongoHelper) {
    
    var mongodb = require('mongodb');
    var config = require('../config/environment');
    var ObjectID = require('mongodb').ObjectID; // http://stackoverflow.com/a/24802198/2726725
    
    var theDb = null; // this will be re-used so the db is only created once (on first request).

    mongoHelper.getDb = function(next) { // the 'next' parameter is the callback function. Takes an error as first parameter, or the created db as the second.
        if (!theDb) {
            // connect to the db
            mongodb.MongoClient.connect(config.mongo.uri, config.mongo.options, function(err, db) {
                if (err) {
                    next(err, null);
                } else {
                    theDb = db;
                    next(null, db);
                }
            });
        } else { // db already exists...
            next(null, theDb);// no error              
        }
    };                                  
                        
    mongoHelper.normalizedId = function(id){
        if (ObjectID.isValid(id)) return new ObjectID(id);
        else return id;
    }

})(module.exports);