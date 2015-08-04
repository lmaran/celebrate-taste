'use strict';

app.config(function ($routeProvider) {
    $routeProvider
		.when('/contact', {
            controller: 'contactController',
            templateUrl: 'app/contact/contact.html'
		});
});