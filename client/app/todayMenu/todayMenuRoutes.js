'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
		.when('/todayMenu', {
            controller: 'todayMenuController',
            templateUrl: 'app/todayMenu/todayMenu.html'
		});
}]);