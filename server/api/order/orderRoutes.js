'use strict';

var express = require('express');
var controller = require('./orderController');
var router = express.Router();

// ---------- OData ----------
router.get('/', controller.getAll);
router.get('/\\$count', controller.getAll);

// ---------- REST ----------
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/', controller.update);
router.delete('/:id', controller.remove);

// ---------- RPC ----------
router.get('/:id/rpc/print/:opCode', controller.print);
router.get('/:id/rpc/getEatSeriesList', controller.getEatSeriesList);

module.exports = router;




