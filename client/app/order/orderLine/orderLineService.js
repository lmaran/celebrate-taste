'use strict';

app.factory('orderLineService', ['$http', function ($http) {

    var factory = {};
    var rootUrl = '/api/orders/';
    var orderLinesPart = '/orderLines/';

    // ---------- CRUD ----------
    factory.create = function (orderId, orderLine) {
        return $http.post(rootUrl + orderId + orderLinesPart, orderLine);
    };   

    factory.getAll = function (orderId) {
        return $http.get(rootUrl + orderId + orderLinesPart).then(function (result) {
            return result.data;
        });
    };

    factory.getById = function (orderId, orderLineId) {
        return $http.get(rootUrl + orderId + orderLinesPart + orderLineId).then(function (result) {
            return result.data;
        });
    };

    factory.update = function (orderId, orderLine) {
        return $http.put(rootUrl + orderId + orderLinesPart, orderLine);
    };

    factory.delete = function (orderId, orderLineId) {
        return $http.delete(rootUrl + orderId + orderLinesPart + orderLineId);
    };
    
    
    // ---------- Misc ----------
    factory.import = function (orderId, importData) {
        return $http.post(rootUrl + orderId + orderLinesPart + 'import', importData);
    }; 
    
    factory.getEatSeriesList = function (orderId) {
        return $http.get(rootUrl + orderId + orderLinesPart + 'getEatSeriesList').then(function (result) {
            return result.data;
        });
    };          

    return factory;
}]);