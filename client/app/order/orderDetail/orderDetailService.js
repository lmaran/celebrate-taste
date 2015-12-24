'use strict';

app.factory('orderDetailService', ['$http', function ($http) {

    var factory = {};
    var rootUrl = '/api/orders/';
    var detailsUrl = '/orderDetails/';

    factory.create = function (item) {
        return $http.post(rootUrl, item);
    };

    factory.getAll = function (id) {
        return $http.get(rootUrl + id + detailsUrl).then(function (result) {
            return result.data;
        });
    };

//     factory.getById = function (itemId) {
//         return $http.get(rootUrl + encodeURIComponent(itemId)).then(function (result) {
//             return result.data;
//         });
//     };
// 
//     factory.update = function (item) {
//         return $http.put(rootUrl, item);
//     };
// 
//     factory.delete = function (itemId) {
//         return $http.delete(rootUrl + encodeURIComponent(itemId));
//     };

    return factory;
}]);