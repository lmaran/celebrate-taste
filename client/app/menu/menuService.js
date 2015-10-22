'use strict';

app.factory('menuService', ['$http', function ($http) {

    var factory = {};
    var rootUrl = '/api/menus/';  

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
    
    factory.getMenu = function (date) { // date as "yyyy-mm-dd"
        return $http.get(rootUrl + 'today/' + date).then(function (result) {
            return result.data;
        });
    };    

    factory.update = function (item) {
        return $http.put(rootUrl, item);
    };

    factory.delete = function (itemId) {
        return $http.delete(rootUrl + encodeURIComponent(itemId));
    };

    return factory;
}]);