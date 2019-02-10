'use strict';

var express = require('express');
var controller = require('./buildInfoController');
var router = express.Router();

router.get('/', controller.getAll);

module.exports = router;