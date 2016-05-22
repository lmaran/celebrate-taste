/* global angular */
'use strict';

var app = angular.module('celebrate-taste', [
    'ngCookies',
    'ngSanitize',   
    'ngComponentRouter',
    'ui.bootstrap',
    'ui.select',
    'ngAnimate', 'toastr'
    //'ngAnimate' // we need it if uibCollapse directive is used
]);

// define the top level Root Component; instantiate this Root Component in our index.html file
app.value("$routerRootComponent", "mainApp");

app.config(['$locationProvider', '$httpProvider', function ($locationProvider, $httpProvider) {

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
}]);

app.config(['toastrConfig',function (toastrConfig) {
    angular.extend(toastrConfig, {
        positionClass: 'toast-top-center',
    });
}]);
  
app.run(['$rootScope', '$location', 'userService', '$window', function ($rootScope, $location, userService, $window) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, nextRoute, currentRoute) {
        //Auth.isLoggedInAsync(function(loggedIn) {
            if (nextRoute.authenticate && !userService.isLoggedIn) {
                event.preventDefault();
                $location.path('/login');
            }
        //});
    });
    
    // set pageTitle for each page: http://stackoverflow.com/a/22326375
    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute, previousRoute) {
        if (currentRoute.hasOwnProperty('$$route')) {
            $rootScope.pageTitle = currentRoute.$$route.title;
        }
        
        // send data to Google Analytics whenever a route is changing
        if ($window.ga) {
            $window.ga('send', 'pageview', {
                page: $location.path(),
                title: $rootScope.pageTitle
            });
        }
    });
    
    // "polluting"" the root scope
    $rootScope.goBack = function() {
        $window.history.back();
    };

}]);
