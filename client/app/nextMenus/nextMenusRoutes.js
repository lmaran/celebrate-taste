'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/nextMenus', {
            controller: 'nextMenusController',
            templateUrl: 'app/nextMenus/nextMenus.html',
			title: 'Meniurile viitoare'
	    })
	    .when('/nextMenus/:menuId/dishes/:dishId', {
	        controller: 'nextMenusItemController',
	        templateUrl: 'app/nextMenus/nextMenusItem.html',
	        title: 'Detalii produs'
	    });                      
}]);