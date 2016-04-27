'use strict';

var express = require('express');
var controller = require('./partnerOrderController');
var router = express.Router();

// ---------- OData ----------
router.get('/', controller.getAll);
router.get('/\\$count', controller.getAll);

module.exports = router;




