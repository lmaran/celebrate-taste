'use strict';

app.factory('deliveryLogService', ['$http', function ($http) {

    var factory = {};
    var rootUrl = '/api/deliveryLogs/';
    
    // ---------- OData ----------  

    
    // ---------- REST ----------
    factory.getAll = function () {
        return $http.get(rootUrl).then(function (result) {
            return result.data;
        });
    };
    
    factory.create = function (item) {
        return $http.post(rootUrl, item);
    };    

    // ---------- RPC ----------
    
    return factory;
}]);