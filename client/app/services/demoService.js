(function(){
    'use strict';

    angular.module('app')
    .factory('demoService', ['$http', function ($http) {
    
        var factory = {};
        var rootUrl = '/api/items/';
    
    
        factory.get = function () {
            return $http.get(rootUrl).then(function (result) {
                return result.data;
            });
        };
    
        return factory;
    }]);
    
})();