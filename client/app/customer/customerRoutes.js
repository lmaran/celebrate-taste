'use strict';

app.config(function ($routeProvider) {
    $routeProvider
        .when('/customers', {
            controller: 'customersController',
            templateUrl: 'app/customer/customers.html',
			title: 'Customers'
	    })
	    .when('/customers/create', {
	        controller: 'customerController',
	        templateUrl: 'app/customer/customer.html',
	        title: 'Create Customer'
	    })
	    .when('/customers/:id', {
	        controller: 'customerController',
	        templateUrl: 'app/customer/customer.html',
	        title: 'Edit Customer',
	        isEditMode: true
	    });	
});