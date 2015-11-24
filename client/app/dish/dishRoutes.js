'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/dishes', {
            controller: 'dishesController',
            templateUrl: 'app/dish/dishes.html',
			title: 'Feluri de mancare'
	    })
	    .when('/admindishes/create', {
	        controller: 'dishController',
	        templateUrl: 'app/dish/dish.html',
	        title: 'Adauga un fel de mancare'
	    })
	    .when('/admin/dishes/:id', {
	        controller: 'dishController',
	        templateUrl: 'app/dish/dish.html',
	        title: 'Editeaza felul de mancare',
	        isEditMode: true
	    });	
}]);