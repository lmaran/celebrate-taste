"use strict";

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
//var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
// mongoose.connect(config.mongo.uri, config.mongo.options);
// mongoose.connection.on('error', function(err) {
// 	console.error('MongoDB connection error: ' + err);
// 	process.exit(-1);
// });
// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
	console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;



















//var path = require('path');

// app.set('port', process.env.PORT || 1337);
// var bodyParser = require('body-parser'); 
// 
// // http://stackoverflow.com/a/28091651/2726725
// // if you are happy with a browser plugin, then you don't need this middleware: https://github.com/intesso/connect-livereload
// if (app.get('env') == 'development') {
//     app.use(require('connect-livereload')());
// };
// 
// app.use(bodyParser.json()); // for parsing application/json
// 
// // set the public static resource folder
// app.use(express.static(path.join(__dirname, '../client')));
// 
// // map the routes
// require('./routes')(app);
// 
// app.listen(app.get('port'), function () {
//     console.log('Server listening on port ' + app.get('port') + ', ' + app.get('env') + ' mode');
// });