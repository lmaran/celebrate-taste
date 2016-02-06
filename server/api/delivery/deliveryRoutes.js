'use strict';

var express = require('express');
var controller = require('./deliveryController');
var router = express.Router();

router.post('/', controller.create);
router.post('/createMany', controller.createMany);
router.get('/', controller.getAll);
router.get('/\\$count', controller.getAll);
router.get('/:id', controller.getById);
router.put('/', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;