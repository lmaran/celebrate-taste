'use strict';

var express = require('express');
var controller = require('./userController');
var config = require('../../config/environment');
var auth = require('./login/loginService');

var router = express.Router();

router.post('/', controller.create);
router.get('/', auth.hasRole('admin'), controller.getAll);
router.get('/:id', controller.getById);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/', controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.remove);

module.exports = router;
