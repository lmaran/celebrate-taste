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
        .when('/settings', {
            controller: 'settingsController',
            templateUrl: 'app/account/settings/settings.html',
            title: 'Schimba parola',      
            authenticate: true
        });
}]);