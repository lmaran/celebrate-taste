'use strict';

app.factory('Auth', ['$location', '$rootScope', '$http', 'User', '$cookies', '$q', 
    function ($location, $rootScope, $http, User, $cookies, $q) {
    
    var currentUser = {};
    
    if($cookies.get('user')) {
        currentUser = angular.fromJson($cookies.get('user'));
    }

    return {
        
        login: function(user, callback) {
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
        },
        
        /**
        * Delete access token and user info
        *
        * @param  {Function}
        */
        logout: function() {
            //$cookies.remove('user');
            //currentUser = {};
            $http.get('/logout')
                .success(function(){})
                .error(function(err){});
            currentUser = {};
        },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
        createUser: function(user, callback) {
            var cb = callback || angular.noop;
            
            return User.save(user,
                function(data) {
                    var now = new Date();
                    var exp = new Date(now.getFullYear(), now.getMonth()+6, now.getDate()); //expire after 6 months
        
                    $cookies.put('user', data.token, {expires:exp});
                    
                    currentUser = User.get();
                    return cb(user);
                },
                function(err) {
                    this.logout();
                    return cb(err);
                }.bind(this)).$promise;
        },

        /**
        * Change password
        *
        * @param  {String}   oldPassword
        * @param  {String}   newPassword
        * @param  {Function} callback    - optional
        * @return {Promise}
        */
        changePassword: function(oldPassword, newPassword, callback) {
            var cb = callback || angular.noop;
        
            return User.changePassword({ id: currentUser._id }, {
                oldPassword: oldPassword,
                newPassword: newPassword
            }, function(user) {
                return cb(user);
            }, function(err) {
                return cb(err);
            }).$promise;
        },
        
        /**
        * Gets all available info on authenticated user
        *
        * @return {Object} user
        */
        getCurrentUser: function() {
            return currentUser;
        },
        
        /**
        * Check if a user is logged in
        *
        * @return {Boolean}
        */
        isLoggedIn: function() {
            //console.log(currentUser);
            return currentUser.hasOwnProperty('role');
        },
        
        /**
        * Waits for currentUser to resolve before checking if user is logged in
        */
        isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
            currentUser.$promise.then(function() {
                cb(true);
            }).catch(function() {
                cb(false);
            });
        } else if(currentUser.hasOwnProperty('role')) {
            cb(true);
        } else {
            cb(false);
        }
        },
        
        /**
        * Check if a user is an admin
        *
        * @return {Boolean}
        */
        isAdmin: function() {
            return currentUser.role === 'admin';
        }

    };
}]);
