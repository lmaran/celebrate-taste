'use strict';

app.config(function ($routeProvider) {
    $routeProvider
		.when('/page1', {
            controller: 'page1Controller',
            templateUrl: 'app/page1/page1.html'
		});
});