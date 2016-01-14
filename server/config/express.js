'use strict';
    
var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan'); // http logger
var logger = require("../utils/logger"); // app logger
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var auth = require('../api/user/login/loginService');

//var session = require('express-session');
//var MongoStore = require('connect-mongo')(session); // use PascalCase to avoid an warning in VSCode
//var mongoose = require('mongoose');

module.exports = function(app) {
    var env = app.get('env');   
    
    app.set('views', config.root + '/server/views');
    
    var exphbs = require('express-handlebars');
    app.engine('.hbs', exphbs({
        defaultLayout: 'main', 
        extname: '.hbs',
        // in the feature we probably don't need the next 2 lines
        // https://github.com/ericf/express-handlebars/issues/147#issuecomment-159737839
        layoutsDir: config.root + '/server/views/layouts/',
        partialsDir: config.root + '/server/views/partials/'     
    }));
    
    app.set('view engine', '.hbs');
    
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names
    
    app.use(passport.initialize());
    
    app.locals.pretty = true; // output pretty html from jade -> http://stackoverflow.com/a/11812841/2726725
    
    app.locals.gaCode = config.gaCode; // google Analytics code (e.g. 'UA-72165579-1'); http://stackoverflow.com/a/25097453

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

    if (env === 'production' || env === 'staging') {
        app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
        
        app.use(express.static(path.join(config.root, 'client'),{index: '_'}));
        app.set('appPath', path.join(config.root, 'client'));    

        // app.use(morgan('tiny', { // like 'dev' but no colors
        //     //skip: function(req, res) { return res.statusCode < 400 },
        //     stream: logger.stream })); 
                      
    } else { // development
        app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));

        // if you are happy with a browser plugin, then you don't need this middleware
        // live-reload corrupts pdf files: http://stackoverflow.com/a/28091651/2726725
        app.use(require('connect-livereload')({ignore: [/print$/]})); // all that ends in 'print': https://github.com/intesso/connect-livereload#options
        
        // without last argument express serves index.html even when my routing is to a different file: //http://stackoverflow.com/a/25167332/2726725
        // It is also recommended to put static middleware first: http://stackoverflow.com/a/28143812/2726725 
        // Have this pb. only when I try to serve another jade page as homepage
        app.use(express.static(path.join(config.root, 'client'),{index: '_'})); 
        app.set('appPath', path.join(config.root, 'client'));

        //app.use(morgan('dev', { stream: logger.stream })); 
    }

    // add a second static source for static files: http://stackoverflow.com/questions/5973432/setting-up-two-different-static-directories-in-node-js-express-framework
    app.use('/public', express.static(path.join(config.root, 'server/public'))); 

    app.use(auth.addUserIfExist());    
};