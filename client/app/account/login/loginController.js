'use strict';

app.controller('loginController', ['$scope', 'Auth', '$location', '$window', function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
        $scope.submitted = true;
        
        if(form.$valid) {
        Auth.login({
            email: $scope.user.email,
            password: $scope.user.password
        })
        .then( function() {
            // Logged in, redirect to home
            $location.path('/');
        })
        .catch( function(err) {
            $scope.errors.other = err.message;
        });
        }
    };
    
    $scope.cancel = function () {
        $window.history.back();
    }
}]);
