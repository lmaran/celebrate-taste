'use strict';

app.factory('preferenceService', ['$http', 'helperService', function ($http, helperService) {

    var factory = {};
    var rootUrl = '/api/preferences/';

    factory.create = function (item) {
        return $http.post(rootUrl, item);
    };
    
    factory.createMany = function (items) {
        return $http.post(rootUrl + 'createMany', items);
    };    

    factory.getByDate = function (dateStr) {
        // OData query
        return $http.get(rootUrl + '?$filter=date eq ' +  '\'' + dateStr + '\'').then(function (result) {            
            return result.data;
        });
    };

    factory.getById = function (itemId) {
        return $http.get(rootUrl + encodeURIComponent(itemId)).then(function (result) {
            return result.data;
        });
    };
    
    factory.getNextDates = function () {
        var todayStr = helperService.getStringFromDate(new Date());
        return $http.get(rootUrl + 'nextDates?today=' + todayStr).then(function (result) {
            return result.data;
        });
    };
    
    factory.getNextByEmployee = function (employeeName) {
        var todayStr = helperService.getStringFromDate(new Date());
        var query = "?$filter=employeeName eq '" +  employeeName +  "' and date gt '" + todayStr + "'";
        //query += "&$orderby=date"
        return $http.get(rootUrl + query).then(function (result) {                
            return result.data;
        });
    };
    
    factory.getByEmployeeAndDate = function (employeeName, dateStr) {
        var query = "?$filter=employeeName eq '" +  employeeName +  "' and date eq '" + dateStr + "'";
        //query += "&$orderby=date"
        return $http.get(rootUrl + query).then(function (result) {                
            return result.data; // normaly it shoud return an array with 0 or 1 elements
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