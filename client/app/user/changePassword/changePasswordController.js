'use strict';

app.controller('changePasswordController', ['$scope', '$window', 'userService', 
    function ($scope, $window, userService) {
        
    $scope.errors = {};

    $scope.changePassword = function(form) {
        $scope.submitted = true;
        if(form.$valid) {
            userService.changePassword($scope.user.oldPassword, $scope.user.newPassword)
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
