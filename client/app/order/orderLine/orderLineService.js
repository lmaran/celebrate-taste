/* global app */
'use strict';

app.factory('orderLineService', ['$http', function ($http) {

    var factory = {};
    var rootUrl = '/api/orderLines/';

    // ---------- OData ----------
    factory.getAll = function (orderId) {
        var query = "?$filter=orderId eq '" + orderId + "'";
        return $http.get(rootUrl + query).then(function (result) {
            return result.data;
        });
    };
        
    factory.getEatSeriesDetails = function (orderId, eatSeries) {
        var query = "?$filter=orderId eq '" + orderId + "' and eatSeries eq '" +  eatSeries +  "'";
        return $http.get(rootUrl + query).then(function (result) {
            return result.data;
        });
    }; 

    factory.getOrderLinesByBadge = function (orderId, badgeCode) {
        var query = "?$filter=orderId eq '" + orderId + "' and badgeCode eq '" + encodeURIComponent(badgeCode) + "'";
        return $http.get(rootUrl + query).then(function (result) {
            return result.data;
        });
    };    
    
    factory.getOrderLinesBySeriesAndStatus = function (orderId, eatSeries, status) {
        var query = "?$filter=orderId eq '" + orderId + "' and eatSeries eq '" +  eatSeries +  "' and status eq '" + status + "'";
        return $http.get(rootUrl + query).then(function (result) {
            return result.data;
        });
    };    
    
    // ---------- REST ----------
    factory.create = function (orderLine) {
        return $http.post(rootUrl, orderLine);
    };   

    factory.getById = function (orderLineId) {
        return $http.get(rootUrl + orderLineId).then(function (result) {
            return result.data;
        });
    };

    factory.update = function (orderLine) {
        return $http.put(rootUrl, orderLine);
    };

    factory.delete = function (orderLineId) {
        return $http.delete(rootUrl + orderLineId);
    };
    
    
    // ---------- RPC ----------
    factory.import = function (importData) {
        return $http.post(rootUrl + 'rpc/import', importData);
    };  
                 

    return factory;
}]);