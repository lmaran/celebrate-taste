'use strict';

var express = require('express');
var controller = require('./menuController');
var router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/nextMenus/', controller.getNextMenus);
router.get('/:id', controller.getById);
router.get('/today/:today', controller.getTodaysMenu);
router.put('/', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;