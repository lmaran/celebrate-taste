'use strict';

var express = require('express');
var controller = require('./orderController');
var orderLineController = require('./orderLine/orderLineController');
var router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/\\$count', function(req, res) {req.params.$count = true; controller.getAll(req, res); });
router.get('/:id', controller.getById);
router.put('/', controller.update);
router.delete('/:id', controller.remove);

router.post('/:id/orderLines', orderLineController.create);
router.get('/:id/orderLines', orderLineController.getAll);
router.get('/:id/orderLines/:orderLineId', orderLineController.getById);
router.put('/:id/orderLines', orderLineController.update);
router.delete('/:id/orderLines/:orderLineId', orderLineController.remove);
router.post('/:id/orderLines/import', orderLineController.import);

module.exports = router;