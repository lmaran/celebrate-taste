'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/login', {
            controller: 'loginController',
            templateUrl: 'app/account/login/login.html',
            title: 'Autentificare'
        })
        .when('/admin/signup', {
            controller: 'signupController',
            templateUrl: 'app/account/signup/signup.html',
            title: 'Inregistrare'      
        })
        .when('/admin/changePassword', {
            controller: 'changePasswordController',
            templateUrl: 'app/account/changePassword/changePassword.html',
            title: 'Schimba parola',      
            authenticate: true
        })
        .when('/admin/resetpassword', {
            controller: 'resetPasswordController',
            templateUrl: 'app/account/resetPassword/forgotPassword.html',
            title: 'Reseteaza parola'     
        })
        .when('/admin/resetpassword:ptoken', {
            controller: 'resetPasswordController',
            templateUrl: 'app/account/resetPassword/resetPassword.html',
            title: 'Reseteaza parola'     
        });                 
}]);