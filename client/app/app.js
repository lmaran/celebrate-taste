'use strict';

var app = angular.module('celebrate-taste', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'ui.select',
    'ngAnimate', 'toastr'
    //'ngAnimate' // we need it if uibCollapse directive is used
]);

 app.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
        // all routes are configured inside each module
        .otherwise({
            redirectTo: '/admin'
      });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
}]);
  
app.run(['$rootScope', '$location', 'userService', function ($rootScope, $location, userService) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, nextRoute, currentRoute) {
        //Auth.isLoggedInAsync(function(loggedIn) {
            if (nextRoute.authenticate && !userService.isLoggedIn) {
                event.preventDefault();
                $location.path('/login');
            }
        //});
    });
    
    // set pageFitle for each page: http://stackoverflow.com/a/22326375
    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute, previousRoute) {
        if (currentRoute.hasOwnProperty('$$route')) {
            $rootScope.pageTitle = currentRoute.$$route.title;
        }
    });
}]);
