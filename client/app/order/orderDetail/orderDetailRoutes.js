'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/orders/:id/orderDetails', {
            controller: 'orderDetailsController',
            templateUrl: 'app/order/orderDetail/orderDetails.html',
			title: 'Detalii comanda'
	    })
	    .when('/admin/orders/:id/orderDetails/create', {
	        controller: 'orderDetailController',
	        templateUrl: 'app/order/orderDetail/orderDetail.html',
	        title: 'Adauga o linie la comanda'
	    })
	    .when('/admin/orders/:id/orderDetails/:id2', {
	        controller: 'orderDetailController',
	        templateUrl: 'app/order/orderDetail/orderDetail.html',
	        title: 'Editeaza linia de comanda',
	        isEditMode: true
	    });	
}]);