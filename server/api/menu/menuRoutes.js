'use strict';

var express = require('express');
var controller = require('./menuController');

var router = express.Router();

router.get('/api/menus/', controller.getAll);
router.get('/api/menus/:id', controller.getById);
router.get('/api/menus/today/:today', controller.getTodaysMenu);
router.post('/api/menus/', controller.create);

// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
router.put('/api/menus/', controller.update);
router.patch('/api/menus/', controller.update);

router.delete('/api/menus/:id', controller.remove);

router.get('/menus/:id/print', controller.printById);

module.exports = router;