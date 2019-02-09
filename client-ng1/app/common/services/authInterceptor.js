'use strict';

app.factory('authInterceptor', ['$rootScope', '$q', '$cookies' ,'$location', '$window',
    function ($rootScope, $q, $cookies, $location, $window) { 
    return {
        // // Add authorization token to headers
        // request: function (config) {
        //     config.headers = config.headers || {};        
        //     if ($cookies.get('access_token')) {
        //         config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        //     }           
        //     return config;
        // },
    
        // Intercept 401s and redirect you to login
        responseError: function(response) {
            if(response.status === 401) {
                $location.path('/admin/login'); // client-side login page
                //$window.location.href = '/login'; //server-side login page
                
                // remove any stale tokens
                // $cookies.remove('user');
                return $q.reject(response);
            }
            else {
                return $q.reject(response);
            }
        }
    };
}]);