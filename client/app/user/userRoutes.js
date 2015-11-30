'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/users', {
            controller: 'usersController',
            templateUrl: 'app/user/users.html',
            title: 'Utilizatori'
        })
        .when('/admin/users/create', {
	        controller: 'userController',
	        templateUrl: 'app/user/user.html',
	        title: 'Adauga utilizator'
	    })
	    .when('/admin/users/:id', {
	        controller: 'userController',
	        templateUrl: 'app/user/user.html',
	        title: 'Editeaza utilizator',
	        isEditMode: true
	    })
        
        
        /*
            Security routes
        */  
        
        .when('/admin/login', {
            controller: 'loginController',
            templateUrl: 'app/user/login/login.html',
            title: 'Autentificare'
        })
        .when('/admin/register', {
            controller: 'registerController',
            templateUrl: 'app/user/register/register.html',
            title: 'Inregistrare'      
        })
        .when('/admin/changePassword', {
            controller: 'changePasswordController',
            templateUrl: 'app/user/changePassword/changePassword.html',
            title: 'Schimba parola',      
            authenticate: true
        })
        .when('/admin/resetpassword', {
            controller: 'resetPasswordController',
            templateUrl: 'app/user/resetPassword/forgotPassword.html',
            title: 'Reseteaza parola'     
        })
        .when('/admin/resetpassword:ptoken', {
            controller: 'resetPasswordController',
            templateUrl: 'app/user/resetPassword/resetPassword.html',
            title: 'Reseteaza parola'     
        });                
}]);