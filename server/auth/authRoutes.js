'use strict';

var express = require('express');
var config = require('../config/environment');
var userService = require('../api/user/userService');

// Passport Configuration
require('./local/passportConfig').setup(userService, config);
// require('./facebook/passport').setup(User, config);
// require('./google/passport').setup(User, config);
// require('./twitter/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local/authLocalRoutes')); // actual route: /auth/local/
// router.use('/facebook', require('./facebook'));
// router.use('/twitter', require('./twitter'));
// router.use('/google', require('./google'));

module.exports = router;