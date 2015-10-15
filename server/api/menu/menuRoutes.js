'use strict';

var express = require('express');
var controller = require('./menuController');

var router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);

// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
router.put('/', controller.update);
router.patch('/', controller.update);

router.delete('/:id', controller.remove);

module.exports = router;