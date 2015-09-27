'use strict';

app.factory('navbarService', ['$http', function ($http) {

    var factory = {};
    var rootUrl = '/api/buildInfo/';

    factory.getAll = function () {
        return $http.get(rootUrl).then(function (result) {
            return result.data;
        });
    };

    return factory;
}]);