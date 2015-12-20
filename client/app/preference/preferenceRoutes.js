'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/preferences', {
            controller: 'preferencesController',
            templateUrl: 'app/preference/preferences.html',
			title: 'Preferinte',
	        //not reload the view if the search part of the url changes. 
            // http://stackoverflow.com/a/14974448/2726725            
            reloadOnSearch:false            
	    })
	    .when('/admin/preferences/create', {
	        controller: 'preferenceController',
	        templateUrl: 'app/preference/addPreferences.html',
	        title: 'Adauga preferinte'
	    })
	    .when('/admin/preferences/:id', {
	        controller: 'preferenceController',
	        templateUrl: 'app/preference/preference.html',
	        title: 'Editeaza preferinte',
	        isEditMode: true
	    });	
}]);