"use strict";

var express = require("express");
var favicon = require("serve-favicon");
//var logger = require("../logging/logger"); // app logger
var bodyParser = require("body-parser");
//var errorHandler = require('errorhandler');
var path = require("path");
var config = require("./config/environment");
var passport = require("passport");
var cookieParser = require("cookie-parser");
var auth = require("./api/user/login/loginService");
var httpLogHandler = require("./logging/httpLogHandler"); // custom error handler

//var session = require('express-session');
//var MongoStore = require('connect-mongo')(session); // use PascalCase to avoid an warning in VSCode
//var mongoose = require('mongoose');

module.exports = function(app) {
    // https://expressjs.com/en/guide/behind-proxies.html
    app.enable("trust proxy"); // allow express to set req.ip

    var env = app.get("env");

    app.set("views", __dirname + "/views");

    var exphbs = require("express-handlebars");
    app.engine(
        ".hbs",
        exphbs({
            defaultLayout: "main",
            extname: ".hbs",
            // in the feature we probably don't need the next 2 lines
            // https://github.com/ericf/express-handlebars/issues/147#issuecomment-159737839
            layoutsDir: path.join(__dirname, "/views/layouts/"),
            partialsDir: path.join(__dirname, "/views/partials/"),

            // ensure the javascript is at the bottom of the code in express-handlebars template
            // http://stackoverflow.com/a/25307270, http://stackoverflow.com/a/21740214
            helpers: {
                section: function(name, options) {
                    if (!this._sections) this._sections = {};
                    this._sections[name] = options.fn(this);
                    return null;
                },
            },
        }),
    );

    app.set("view engine", ".hbs");

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names

    app.use(passport.initialize());

    app.locals.gaCode = config.gaCode; // google Analytics code (e.g. 'UA-72165579-1'); http://stackoverflow.com/a/25097453

    app.use(favicon(path.join(__dirname, "/public", "favicon.ico")));

    var srcOrDev = config.env === "production" ? "dist" : "src";

    // static for clients
    app.use("/assets", express.static(path.join(__dirname, `../../client/${srcOrDev}/assets`)));
    // js files for clients
    app.use("/app", express.static(path.join(__dirname, `../../client/${srcOrDev}/app`)));

    // static for server
    app.use("/public", express.static(path.join(__dirname, "public")));

    // for js files used by some server views
    app.use("/views", express.static(path.join(__dirname, "views")));

    // log all http requests (like morgan)
    app.use(httpLogHandler());

    app.use(auth.addUserIfExist());
};
