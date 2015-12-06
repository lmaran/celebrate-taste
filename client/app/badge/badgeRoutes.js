'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/badges', {
            controller: 'badgesController',
            templateUrl: 'app/badge/badges.html',
			title: 'Carduri'
	    })
	    .when('/admin/badges/create', {
	        controller: 'badgeController',
	        templateUrl: 'app/badge/badge.html',
	        title: 'Adauga card'
	    })
	    .when('/admin/badges/:id', {
	        controller: 'badgeController',
	        templateUrl: 'app/badge/badge.html',
	        title: 'Editeaza card',
	        isEditMode: true
	    });	
}]);