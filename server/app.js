"use strict";

var express = require('express');
var app = express();

var path = require('path');

app.set('port', process.env.PORT || 1337);
var bodyParser = require('body-parser'); 

// http://stackoverflow.com/a/28091651/2726725
// if you are happy with a browser plugin, then you don't need this middleware: https://github.com/intesso/connect-livereload
if (app.get('env') == 'development') {
    app.use(require('connect-livereload')());
};

app.use(bodyParser.json()); // for parsing application/json

// set the public static resource folder
app.use(express.static(path.join(__dirname, '../client')));

// map the routes
require('./routes')(app);

app.listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port') + ', ' + app.get('env') + ' mode');
});