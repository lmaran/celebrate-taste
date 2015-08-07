'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
		.when('/page1', {
            controller: 'page1Controller',
            templateUrl: 'app/page1/page1.html'
		});
}]);