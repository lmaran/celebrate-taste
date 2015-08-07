'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
		.when('/contact', {
            controller: 'contactController',
            templateUrl: 'app/contact/contact.html'
		});
}]);