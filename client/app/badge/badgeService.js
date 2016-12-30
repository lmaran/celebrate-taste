'use strict';

app.factory('badgeService', ['$http', function ($http) {

    var factory = {};
    var rootUrl = '/api/badges/';
    
    // ---------- OData ----------  
    // factory.getByBadge = function (badgeCode) {
    //     var query = "?$filter=badgeCode eq '" + badgeCode + "' and isActive eq true";
    //     return $http.get(rootUrl + query).then(function (result) {                
    //         return result.data; // normaly it shoud return an array with 0 or 1 elements
    //     });
    // };
    
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
        return $http.get(rootUrl + encodeURIComponent(itemId)).then(function (result) {
            return result.data;
        });
    };

    factory.update = function (item) {
        return $http.put(rootUrl, item);
    };

    factory.delete = function (itemId) {
        return $http.delete(rootUrl + encodeURIComponent(itemId));
    };


    // ---------- RPC ----------
    
    return factory;
}]);