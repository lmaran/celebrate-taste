'use strict';

var express = require('express');
var controller = require('./customerController');
var router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;