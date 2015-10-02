'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/customerEmployees', {
            controller: 'customerEmployeesController',
            templateUrl: 'app/customerEmployee/customerEmployees.html',
			title: 'Angajati client'
	    })
	    .when('/customerEmployees/create', {
	        controller: 'customerEmployeeController',
	        templateUrl: 'app/customerEmployee/customerEmployee.html',
	        title: 'Adauga angajat'
	    })
	    .when('/customerEmployees/:id', {
	        controller: 'customerEmployeeController',
	        templateUrl: 'app/customerEmployee/customerEmployee.html',
	        title: 'Editeaza angajat',
	        isEditMode: true
	    });	
}]);