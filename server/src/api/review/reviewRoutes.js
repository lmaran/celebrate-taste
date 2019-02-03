'use strict';

var express = require('express');
var controller = require('./reviewController');
var router = express.Router();

// ---------- OData ----------
router.get('/', controller.getAll);
// router.get('/\\$count', controller.getAll);

// // ---------- REST ----------
// router.post('/', controller.create);
// router.get('/:id', controller.getById);
// router.put('/', controller.update);
// router.delete('/:id', controller.remove);

// // ---------- RPC ----------
// router.post('/rpc/createMany', controller.createMany);
// router.get('/rpc/getNextDates', controller.getNextDates); //returns a list of available dates

module.exports = router;