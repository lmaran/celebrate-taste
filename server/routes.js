'use strict';

var errors = require('./components/errors');
var path = require('path');
var auth = require('./api/user/login/loginService');

module.exports = function(app) {
    
    // API routes
    app.use('/api/users',require('./api/user/userRoutes'));
    app.use('/api/customers', auth.hasRole('admin'), require('./api/customer/customerRoutes'));
    app.use('/api/buildInfo', require('./api/buildInfo/buildInfoRoutes'));   
    app.use('/api/dishes', auth.hasRole('admin'), require('./api/dish/dishRoutes'));
    app.use('/api/customerEmployees', auth.hasRole('admin'), require('./api/customerEmployee/customerEmployeeRoutes'));
    app.use('/api/menus', auth.hasRole('admin'), require('./api/menu/menuRoutes'));

    
    // RPC routes
    app.post('/login/', require('./api/user/login/local/loginLocalController').authenticate);       
    app.get('/logout', auth.isAuthenticated(), require('./api/user/logout/logoutController').logout);
    // app.get('/me', auth.isAuthenticated(), require('./api/user/userController').me);
    app.post('/me/changepassword', auth.isAuthenticated(), require('./api/user/userController').changePassword); 
       
    app.get('/menus/currentWeek/print',  require('./api/menu/menuController').printCurrentWeek);
    app.get('/menus/nextWeek/print', require('./api/menu/menuController').printNextWeek);
    app.get('/menus/:id/print', require('./api/menu/menuController').printById);
    
    
    // server-side views
    app.get('/',function(req,res){res.render('home/home', {user: req.user});}); 
    app.get('/contact', function(req,res){res.render('contact/contact', {user: req.user});});
    app.get('/login', function(req,res){res.render('user/login/login');}); 
    app.get('/changePassword', auth.isAuthenticated(), function(req,res){res.render('user/changePassword/changePassword');});
    app.get('/todaysMenu', require('./views/menu/menuController').renderTodaysMenu);  
    app.get('/nextMenus', require('./views/menu/menuController').renderNextMenus);     

    
    // client-side views
    app.get('/admin|/admin/*', auth.hasRole('admin'), function(req, res) {res.sendFile(path.resolve(app.get('appPath') + '/index.html'));});

  
    // All undefined asset or api routes should return a 404
    app.get('/:url(api|auth|components|app|bower_components|assets)/*', errors[404]);       
};
