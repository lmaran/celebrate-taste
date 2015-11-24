'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/menus', {
            controller: 'menusController',
            templateUrl: 'app/menu/menus.html',
			title: 'Meniuri'
	    })
	    .when('/admin/menus/create', {
	        controller: 'menuController',
	        templateUrl: 'app/menu/menu.html',
	        title: 'Adauga meniu'
	    })
	    .when('/admin/menus/:id', {
	        controller: 'menuController',
	        templateUrl: 'app/menu/menu.html',
	        title: 'Editeaza meniu',
	        isEditMode: true
	    })
	    .when('/admin/menus/:id/add', {
	        controller: 'addToMenuController',
	        templateUrl: 'app/menu/addToMenu.html',
	        title: 'Adauga la meniu',
	        isEditMode: true
	    })
	    .when('/admin/menus/:menuId/dishes/:dishId', {
	        controller: 'menuItemController',
	        templateUrl: 'app/menu/menuItem.html',
	        title: 'Editeaza produsul din meniu',
	        isEditMode: true
	    });                
}]);