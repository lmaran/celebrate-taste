'use strict';

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/admin', {
            controller: 'adminController',
            templateUrl: 'app/admin/admin.html'
    });
}]);