'use strict';

app.config(function ($routeProvider) {
    $routeProvider
		.when('/', {
            controller: 'homeController',
            templateUrl: 'app/home/home.html'
		});
});