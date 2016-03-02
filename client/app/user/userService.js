'use strict';

app.factory('userService', ['$http', '$cookies', '$q',
    function ($http, $cookies, $q) {

    var factory = {};
    var rootUrl = '/api/users/';

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
    
    
    /*
        Auth operations
    */
    
    var currentUser = {};
    
    if($cookies.get('user')) {
        currentUser = angular.fromJson($cookies.get('user'));
    }
        
    factory.changePassword = function(oldPassword, newPassword){
        return $http.put(rootUrl + 'me/changepassword', {
            oldPassword: oldPassword,
            newPassword: newPassword
        });
    };
    
    factory.login = function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        
        $http.post('/login', {
            email: user.email,
            password: user.password
        }).
        success(function(data) {
            // this cookie comes now from server
            // var now = new Date();
            // var exp = new Date(now.getFullYear(), now.getMonth()+6, now.getDate()); //expire after 6 months   
            // $cookies.put('user', JSON.stringify(data), {expires:exp});
            
            //currentUser = User.get();
            currentUser = data;
            
            deferred.resolve(data);
            return cb();
        }).
        error(function(err) {
            this.logout();
            deferred.reject(err);
            return cb(err);
        }.bind(this));
    
        return deferred.promise;
    };
    
    factory.logout = function() {
        //$cookies.remove('user');
        //currentUser = {};
        $http.get('/logout')
            .success(function(){})
            .error(function(err){});
        currentUser = {};
    };


    factory.getCurrentUser = function() {
        return currentUser;
    };
    
    factory.isLoggedIn = function() {
        //console.log(currentUser);
        return currentUser.hasOwnProperty('role');
    }; 
    
    factory.isAdmin = function() {
        return currentUser.role === 'admin';
    };
        
    return factory;
}]);