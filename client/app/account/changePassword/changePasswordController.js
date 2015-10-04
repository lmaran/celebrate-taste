'use strict';

app.controller('changePasswordController', ['$scope', 'User', 'Auth', '$window', function ($scope, User, Auth, $window) {
    $scope.errors = {};

    $scope.changePassword = function(form) {
        $scope.submitted = true;
        if(form.$valid) {
            Auth.changePassword($scope.user.oldPassword, $scope.user.newPassword)
            .then( function() {
                $scope.message = 'Parola a fost schimbata cu succes.';
            })
            .catch( function() {
                form.password.$setValidity('mongoose', false);
                $scope.errors.other = 'Parola incorecta';
                $scope.message = '';
            });
        }
	};
    
    $scope.cancel = function () {
        $window.history.back();
    }
        
}]);
