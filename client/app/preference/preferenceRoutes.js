'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/preferences', {
            controller: 'preferencesController',
            templateUrl: 'app/preference/preferences.html',
			title: 'Preferinte'
	    })
	    .when('/admin/preferences/create', {
	        controller: 'preferenceController',
	        templateUrl: 'app/preference/preference.html',
	        title: 'Adauga preferinta'
	    })
	    .when('/admin/preferences/:id', {
	        controller: 'preferenceController',
	        templateUrl: 'app/preference/preference.html',
	        title: 'Editeaza preferinta',
	        isEditMode: true
	    });	
}]);