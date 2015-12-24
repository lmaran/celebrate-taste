'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/orders', {
            controller: 'ordersController',
            templateUrl: 'app/order/orders.html',
			title: 'Comenzi'
	    })
	    .when('/admin/orders/create', {
	        controller: 'orderController',
	        templateUrl: 'app/order/order.html',
	        title: 'Adauga o comanda'
	    })
	    .when('/admin/orders/:id', {
	        controller: 'orderController',
	        templateUrl: 'app/order/order.html',
	        title: 'Editeaza comanda',
	        isEditMode: true
	    });	
}]);