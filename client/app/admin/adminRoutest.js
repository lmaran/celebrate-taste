'use strict';

app.config(function ($routeProvider) {
    $routeProvider
        .when('/admin', {
            controller: 'adminController',
            templateUrl: 'app/admin/admin.html'
    });
});