'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');
//var session = require('express-session');
//var MongoStore = require('connect-mongo')(session); // use PascalCase to avoid an warning in VSCode
//var mongoose = require('mongoose');

module.exports = function(app) {
    var env = app.get('env');
    
    app.set('views', config.root + '/server/views');
    app.set('view engine', 'jade');
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(passport.initialize());
    
    app.locals.pretty = true; // output pretty html from jade -> http://stackoverflow.com/a/11812841/2726725

    // Persist sessions with mongoStore
    // We need to enable sessions for passport twitter because its an oauth 1.0 strategy
    // app.use(session({
    //     secret: config.secrets.session,
    //     resave: true,
    //     saveUninitialized: true,
    //     store: new MongoStore({
    //       mongooseConnection: mongoose.connection,
    //       db: 'node-fullstack'
    //     })
    // }));
  
    if ('production' === env || 'staging' === env) {
        app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
        
        app.use(express.static(path.join(config.root, 'client'),{index: '_'}));
        app.set('appPath', path.join(config.root, 'client'));    
        
        app.use(morgan('dev'));   
    }

    if ('development' === env || 'test' === env) {
        app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));

        // if you are happy with a browser plugin, then you don't need this middleware
        // live-reload corrupts pdf files: http://stackoverflow.com/a/28091651/2726725

        app.use(require('connect-livereload')({ignore: [/print$/]})); // all that ends in 'print': https://github.com/intesso/connect-livereload#options
        
        // without last argument express serves index.html even when my routing is to a different file: //http://stackoverflow.com/a/25167332/2726725
        // It is also recommended to put static middleware first: http://stackoverflow.com/a/28143812/2726725 
        // Have this pb. only when I try to serve another jade page as homepage
        app.use(express.static(path.join(config.root, 'client'),{index: '_'})); 
        app.set('appPath', path.join(config.root, 'client'));
        app.use(morgan('dev')); 
        
        // se pare ca orice errhandler de aici nu functioneaza
        app.use(errorHandler()); // Error handler - has to be last
        //app.use(errorHandler({log: errorNotification}))
        
        //app.use(errorHandler);
        
        // app.use(function(err, req, res, next) {
        //     console.error("aaa");
        //     res.status(500).send('Something broke!');
        // });
    }
    
    // function logErrors(err, req, res, next) {
    //   console.log(123456);
    //   next(err);
    // }
    // 
    // function errorHandler(err, req, res, next) {
    //   if (res.headersSent) {
    //     return next(err);
    //   };
    //   res.status(500);
    //   //res.render('error', { error: err });
    //   res.send('oops! something broke');
    // }
    
    // function errorNotification(err, str, req) {
    //   var title = 'Error in ' + req.method + ' ' + req.url
    // 
    //     console.log(title);
    //   // notifier.notify({
    //     // title: title,
    //     // message: str
    //   // })
    // }

};