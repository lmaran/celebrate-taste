'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/users', {
            controller: 'usersController',
            templateUrl: 'app/user/users.html',
            title: 'Utilizatori'
        })
        .when('/users/create', {
	        controller: 'userController',
	        templateUrl: 'app/user/user.html',
	        title: 'Adauga utilizator'
	    })
	    .when('/users/:id', {
	        controller: 'userController',
	        templateUrl: 'app/user/user.html',
	        title: 'Editeaza utilizator',
	        isEditMode: true
	    });	        
}]);