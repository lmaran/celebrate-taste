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
	    })
	    .when('/menus/:id/add', {
	        controller: 'addToMenuController',
	        templateUrl: 'app/menu/addToMenu.html',
	        title: 'Adauga la meniu',
	        isEditMode: true
	    })
	    .when('/menus/:menuId/dishes/:dishId', {
        //.when('/menus2/:menuId', {
	        controller: 'menuItemController',
	        templateUrl: 'app/menu/menuItem.html',
	        title: 'Editeaza produsul din meniu',
	        isEditMode: true
	    });                
}]);