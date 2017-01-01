'use strict';

var express = require('express');
var controller = require('./customerEmployeeController');
var router = express.Router();

// ---------- OData ----------
router.get('/getAllWithBadgeInfo', controller.getAllWithBadgeInfo);
router.get('/', controller.getAll);
router.get('/\\$count', controller.getAll);

// ---------- REST ----------
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;