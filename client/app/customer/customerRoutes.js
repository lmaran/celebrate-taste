'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/customers', {
            controller: 'customersController',
            templateUrl: 'app/customer/customers.html',
			title: 'Clienti'
	    })
	    .when('/customers/create', {
	        controller: 'customerController',
	        templateUrl: 'app/customer/customer.html',
	        title: 'Adauga client'
	    })
	    .when('/customers/:id', {
	        controller: 'customerController',
	        templateUrl: 'app/customer/customer.html',
	        title: 'Editeaza client',
	        isEditMode: true
	    });	
}]);