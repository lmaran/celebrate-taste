'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/login', {
            controller: 'loginController',
            templateUrl: 'app/account/login/login.html',
            title: 'Autentificare'
        })
        .when('/signup', {
            controller: 'signupController',
            templateUrl: 'app/account/signup/signup.html',
            title: 'Inregistrare'      
        })
        .when('/changePassword', {
            controller: 'changePasswordController',
            templateUrl: 'app/account/changePassword/changePassword.html',
            title: 'Schimba parola',      
            authenticate: true
        })
        .when('/resetpassword', {
            controller: 'resetPasswordController',
            templateUrl: 'app/account/resetPassword/forgotPassword.html',
            title: 'Reseteaza parola'     
        })
        .when('/resetpassword:ptoken', {
            controller: 'resetPasswordController',
            templateUrl: 'app/account/resetPassword/resetPassword.html',
            title: 'Reseteaza parola'     
        });                 
}]);