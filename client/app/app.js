'use strict';

var app = angular.module('my-app', [
    //'ngAnimate',
    //'ngSanitize',
    'ngRoute',
    //'pascalprecht.translate',
    //'ngCookies',
    //'monospaced.elastic',
    //'mgcrea.ngStrap',
    //'ui.bootstrap.accordion',
    'ui.bootstrap',
    //'angularFileUpload'
]);

app.config(['$routeProvider', '$locationProvider',  function ($routeProvider, $locationProvider) {
        
        $routeProvider
        .when('/',
            {
            controller: 'homeController',
            templateUrl: 'app/home/home.html'
        })

        // *** teachers ***
        .when('/page1', {
            controller: 'page1Controller',
            templateUrl: 'app/page1/page1.html',
            title: 'Page 1'
        })

        // *** contact ***
        .when('/contact', {
            controller: 'contactController',
            templateUrl: 'app/contact/contact.html',
            title: 'Contact'
        })

        // *** board ***
        .when('/conducere', {
            controller: 'staffController',
            templateUrl: 'app/views/staff.html',
            title: 'Conducere'
        })

        .otherwise({ redirectTo: '/' });
        
        // use the HTML5 History API - http://scotch.io/quick-tips/js/angular/pretty-urls-in-angularjs-removing-the-hashtag
        $locationProvider.html5Mode(true);
        
        
    }]);


//app.config(['$httpProvider', function ($httpProvider) {
//    $httpProvider.interceptors.push('authInterceptor');
//}]);
