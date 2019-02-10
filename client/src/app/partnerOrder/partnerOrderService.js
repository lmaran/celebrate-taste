'use strict';

app.factory('partnerOrderService', ['$http', function ($http) {

    var factory = {};
    var rootUrl = '/api/partnerOrders/';


    // ---------- OData ----------
    factory.count = function(field, value){
        return $http.get(rootUrl + '$count?$filter=' + field + ' eq ' + '\'' + value + '\'').then(function (result) {
            return result.data;
        });        
    }
        
    factory.getAllOpen = function () {
        var query = "?$filter=status eq 'open'";
        return $http.get(rootUrl + query).then(function (result) {                
            return result.data; // normaly it shoud return an array with 0 or 1 elements
        });
    };
    
    
    // ---------- REST ----------
    factory.create = function (item) {
        return $http.post(rootUrl, item);
    };

    factory.getAll = function () {
        return $http.get(rootUrl).then(function (result) {
            return result.data;
        });
    };

    factory.getById = function (itemId) {
        return $http.get(rootUrl + itemId).then(function (result) {
            return result.data;
        });
    };

    factory.update = function (item) {
        return $http.put(rootUrl, item);
    };

    factory.delete = function (itemId) {
        return $http.delete(rootUrl + itemId);
    };

    
    // ---------- RPC ----------
    factory.getEatSeriesList = function (partnerOrderId) {
        return $http.get(rootUrl + partnerOrderId + '/rpc/getEatSeriesList' ).then(function (result) {
            return result.data;
        });
    }; 
    
    factory.getDeliverySummary = function (partnerOrderId, eatSeries) {
        return $http.get(rootUrl + partnerOrderId + '/rpc/getDeliverySummary/' + encodeURIComponent(eatSeries) ).then(function (result) {
            return result.data;
        });
    };  
    
    factory.closepartnerOrder = function (partnerOrderId) {
        return $http.post(rootUrl + partnerOrderId + '/rpc/closepartnerOrder').then(function (result) {
            return result.data;
        });
    };           

    return factory;
}]);