'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/menus', {
            controller: 'menusController',
            templateUrl: 'app/menu/menus.html',
			title: 'Meniuri'
	    })
	    .when('/menus/create', {
	        controller: 'menuController',
	        templateUrl: 'app/menu/menu.html',
	        title: 'Adauga meniu'
	    })
	    .when('/menus/:id', {
	        controller: 'menuController',
	        templateUrl: 'app/menu/menu.html',
	        title: 'Editeaza meniu',
	        isEditMode: true
	    });	
}]);