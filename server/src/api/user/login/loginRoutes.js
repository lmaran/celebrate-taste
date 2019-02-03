'use strict';

var express = require('express');
var router = express.Router();
var loginController = require('./local/loginLocalController');


//router.use('/local', require('./local/loginLocalRoutes'));
router.post('/local/', loginController.authenticate);
// router.use('/facebook', require('./facebook'));
// router.use('/twitter', require('./twitter'));
// router.use('/google', require('./google'));

module.exports = router;