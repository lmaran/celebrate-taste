'use strict';

var express = require('express');
var controller = require('./userController');
var config = require('../../config/environment');
var auth = require('./login/loginService');

var router = express.Router();

router.post('/', controller.create);
router.get('/', auth.hasRole('admin'), controller.getAll);
router.get('/\\$count', controller.getAll);
router.get('/:id', auth.hasRole('admin'), controller.getById);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/me/changepassword', auth.isAuthenticated(), controller.changePassword);
router.put('/', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.remove);

module.exports = router;
