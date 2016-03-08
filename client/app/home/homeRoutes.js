'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
		.when('/admin', {
            controller: 'homeController',
            templateUrl: 'app/home/home.html',
            authenticate: true
		});
}]);