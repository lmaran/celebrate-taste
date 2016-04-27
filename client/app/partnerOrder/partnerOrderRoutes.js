'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin/partnerOrders', {
            controller: 'partnerOrdersController',
            templateUrl: 'app/partnerOrder/partnerOrders.html',
			title: 'Comenzi'
	    });
}]);