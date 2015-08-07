'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
		.when('/', {
            controller: 'homeController',
            templateUrl: 'app/home/home.html'
		});
}]);