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
                    // Shawn recommends that we wrap the db in an object so we can extend it easily later.
                    theDb = {
                        db: db,
                        customers: db.collection('customers'),
                        users: db.collection('users'),
                        dishes: db.collection('dishes'),
                        customerEmployees: db.collection('customerEmployees'),
                        menus: db.collection('menus')
                                            
                    };
                    next(null, theDb);
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