'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function(app) {
    
    // Insert routes below
    app.use('/api/users', require('./api/user/userRoutes'));
    app.use('/api/customers', require('./api/customer/customerRoutes'));
    app.use('/api/buildInfo', require('./api/buildInfo/buildInfoRoutes'));
    
    app.use('/api/dishes', require('./api/dish/dishRoutes'));
    app.use('/api/customerEmployees', require('./api/customerEmployee/customerEmployeeRoutes'));
    //app.use('/api/menus', require('./api/menu/menuRoutes'));
    app.use(require('./api/menu/menuRoutes')); // has special routes
    
    app.use('/auth', require('./api/user/login/loginRoutes'));
  
    app.get('/',function(req,res){res.render('home');}); 
    app.get('/contact', function(req,res){res.render('contact');});
    app.get('/login', function(req,res){res.render('account/login');});
    
    app.post('/login', function(req,res){
        res.json(req.body);
    })
    
    app.route('/admin|/admin/*')
        .get(function(req, res) {
          res.sendFile(path.resolve(app.get('appPath') + '/index.html')); 
        });
  
    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);       

    // All other routes should redirect to the index.jade   
    app.route('/*')
        .get(function(req, res) {
          //res.sendFile(path.resolve(app.get('appPath') + '/index.html')); 
          res.render('index');
        });
};
