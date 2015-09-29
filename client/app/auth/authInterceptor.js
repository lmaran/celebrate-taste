'use strict';

app.factory('authInterceptor', ['$rootScope', '$q', '$location', '$rootElement', '$window',
    function ($rootScope, $q, $location, $rootElement, $window) {
    
    var appName = $rootElement.attr('ng-app'); // http://stackoverflow.com/a/17503179
    var tokenKey = appName + '_token';
    
    return {
        // Add authorization token to headers
        request: function (config) {
            config.headers = config.headers || {};        
            var token = $window.localStorage.getItem(tokenKey);
            if(token) {
                config.headers.Authorization = 'Bearer ' + token;
            }            
            return config;
        },
    
        // Intercept 401s and redirect you to login
        responseError: function(response) {
            if(response.status === 401) {
                $location.path('/login');
                // remove any stale tokens
                $window.localStorage.removeItem(tokenKey);
                return $q.reject(response);
            }
            else {
                return $q.reject(response);
            }
        }
    };
}]);