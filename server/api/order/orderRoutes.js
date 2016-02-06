'use strict';

var express = require('express');
var controller = require('./orderController');
var orderLineController = require('./orderLine/orderLineController');
var router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/\\$count', controller.getAll);
router.get('/:id', controller.getById);
router.put('/', controller.update);
router.delete('/:id', controller.remove);

router.post('/:id/orderLines', orderLineController.create);
router.get('/:id/orderLines', orderLineController.getAll);
router.get('/:id/orderLines/getEatSeriesList', orderLineController.getEatSeriesList);
router.get('/:id/orderLines/:orderLineId', orderLineController.getById);
router.put('/:id/orderLines', orderLineController.update);
router.delete('/:id/orderLines/:orderLineId', orderLineController.remove);
router.post('/:id/orderLines/import', orderLineController.import);

router.get('/:id/:opCode/print', orderLineController.print);

module.exports = router;