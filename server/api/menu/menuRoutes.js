'use strict';

var express = require('express');
var controller = require('./menuController');
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
router.get('/rpc/getActiveMenus', controller.getActiveMenus); // returns today + next menus

module.exports = router;