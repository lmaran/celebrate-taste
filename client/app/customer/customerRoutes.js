'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/customers', {
            controller: 'customersController',
            templateUrl: 'app/customer/customers.html',
			title: 'Clienti'
	    })
	    .when('/admin/customers/create', {
	        controller: 'customerController',
	        templateUrl: 'app/customer/customer.html',
	        title: 'Adauga client'
	    })
	    .when('/admin/customers/:id', {
	        controller: 'customerController',
	        templateUrl: 'app/customer/customer.html',
	        title: 'Editeaza client',
	        isEditMode: true
	    });	
}]);