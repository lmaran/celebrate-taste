'use strict';

app.controller('loginController', ['$scope', 'userService', '$location', '$window', 
    function ($scope, userService, $location, $window) {
        
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
        $scope.submitted = true;
        
        if(form.$valid) {
        userService.login({
            email: $scope.user.email,
            password: $scope.user.password
        })
        .then( function() {
            $location.path('/admin/');
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
