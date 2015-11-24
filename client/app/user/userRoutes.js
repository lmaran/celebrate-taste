'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/users', {
            controller: 'usersController',
            templateUrl: 'app/user/users.html',
            title: 'Utilizatori'
        })
        .when('/admin/users/create', {
	        controller: 'userController',
	        templateUrl: 'app/user/user.html',
	        title: 'Adauga utilizator'
	    })
	    .when('/admin/users/:id', {
	        controller: 'userController',
	        templateUrl: 'app/user/user.html',
	        title: 'Editeaza utilizator',
	        isEditMode: true
	    });	        
}]);