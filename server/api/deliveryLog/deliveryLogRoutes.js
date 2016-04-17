'use strict';

var express = require('express');
var controller = require('./deliveryLogController');
var router = express.Router();

// ---------- OData ----------
router.get('/', controller.getAll);
router.get('/\\$count', controller.getAll);

// ---------- REST ----------
router.post('/', controller.create);

module.exports = router;