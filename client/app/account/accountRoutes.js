'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/login', {
            controller: 'loginController',
            templateUrl: 'app/account/login/login.html'
        })
        .when('/signup', {
            controller: 'signupController',
            templateUrl: 'app/account/signup/signup.html'        
        })
        .when('/settings', {
            controller: 'settingsController',
            templateUrl: 'app/account/settings/settings.html',        
            authenticate: true
        });
}]);