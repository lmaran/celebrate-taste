'use strict';

var app = angular.module('celebrate-taste', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap'
    //'ngAnimate' // we need it if uibCollapse directive is used
]);

 app.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
        // all routes are configured inside each module
        .otherwise({
            redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
}]);
  
app.run(['$rootScope', '$location', 'Auth', function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, nextRoute, currentRoute) {
        Auth.isLoggedInAsync(function(loggedIn) {
            if (nextRoute.authenticate && !loggedIn) {
                event.preventDefault();
                $location.path('/login');
            }
        });
    });
    
    // set pageFitle for each page: http://stackoverflow.com/a/22326375
    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute, previousRoute) {
        if (currentRoute.hasOwnProperty('$$route')) {
            $rootScope.pageTitle = currentRoute.$$route.title;
        }
    });
}]);
