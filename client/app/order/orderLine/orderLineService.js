'use strict';

app.factory('orderLineService', ['$http', function ($http) {

    var factory = {};
    var rootUrl = '/api/orders/';
    var orderLinesPart = '/orderLines/';

    factory.create = function (orderId, orderLine) {
        return $http.post(rootUrl + orderId + orderLinesPart, orderLine);
    };

    factory.getAll = function (orderId) {
        return $http.get(rootUrl + orderId + orderLinesPart).then(function (result) {
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