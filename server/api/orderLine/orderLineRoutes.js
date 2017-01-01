'use strict';

var express = require('express');
var controller = require('./orderLineController');
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

// ---------- RPC ----------
router.post('/rpc/import', controller.import);

// router.get('/rpc/print/:opCode/:orderId', controller.print);

module.exports = router;