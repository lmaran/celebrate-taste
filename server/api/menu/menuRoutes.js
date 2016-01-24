'use strict';

var express = require('express');
var controller = require('./menuController');
var router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/activeMenus', controller.getActiveMenus); // returns today + next menus
router.get('/\\$count', controller.getAll);
router.get('/:id', controller.getById);
router.put('/', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;