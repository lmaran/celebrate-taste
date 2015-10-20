'use strict';

app.factory('menuService', ['$http', function ($http) {

    var factory = {};
    var rootUrl = '/api/menus/';
    
    
    var getToday = function(){
        // http://stackoverflow.com/a/4929629
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        
        if(dd<10) {
            dd='0'+dd
        } 
        
        if(mm<10) {
            mm='0'+mm
        }
        
        return yyyy + '-' + mm + '-' + dd;
    };    

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
    
    factory.getTodaysMenu = function () {
        var today = getToday();
        return $http.get(rootUrl + 'today/' + today).then(function (result) {
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