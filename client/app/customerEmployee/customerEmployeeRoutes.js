'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/customerEmployees', {
            controller: 'customerEmployeesController',
            templateUrl: 'app/customerEmployee/customerEmployees.html',
			title: 'Angajati client'
	    })
	    .when('/admin/customerEmployees/create', {
	        controller: 'customerEmployeeController',
	        templateUrl: 'app/customerEmployee/customerEmployee.html',
	        title: 'Adauga angajat'
	    })
	    .when('/admin/customerEmployees/:id', {
	        controller: 'customerEmployeeController',
	        templateUrl: 'app/customerEmployee/customerEmployee.html',
	        title: 'Editeaza angajat',
	        isEditMode: true
	    });	
}]);