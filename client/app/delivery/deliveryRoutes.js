'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/deliveries', {
            controller: 'deliveriesController',
            templateUrl: 'app/delivery/deliveries.html',
			title: 'Livrari'
	    })    
	    .when('/admin/deliveries/create', {
	        controller: 'deliveryController',
	        templateUrl: 'app/delivery/delivery.html',
	        title: 'Adauga o livrare'
	    })
	    .when('/admin/deliveries/:id', {
	        controller: 'deliveryController',
	        templateUrl: 'app/delivery/delivery.html',
	        title: 'Livrare',
	        isEditMode: true
	    });	
}]);