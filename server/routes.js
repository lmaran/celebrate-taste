'use strict';

var path = require('path');

module.exports = function (app) {

    // API routes
    // ====================================================

    var items = require('./api/items/itemsController');
    app.get('/api/items/', items.getAll);


    // front-end routes
    // ====================================================


    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function (req, res) {
        res.sendFile(path.join(__dirname, '../client/index.html'));
        //res.sendfile(app.get('appPath') + '/index.html');
    });

};
