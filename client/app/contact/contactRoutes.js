'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
		.when('/admin/contact', {
            controller: 'contactController',
            templateUrl: 'app/contact/contact.html'
		});
}]);