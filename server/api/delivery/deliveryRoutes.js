'use strict';

var express = require('express');
var controller = require('./deliveryController');
var router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;