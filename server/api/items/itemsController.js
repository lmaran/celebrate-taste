'use strict';

var itemsService = require('./itemsService');


exports.getAll = function (req, res) {
    itemsService.getAll(function (item) {
        res.send(item);
    });
};
