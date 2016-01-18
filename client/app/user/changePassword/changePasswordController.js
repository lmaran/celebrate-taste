'use strict';

app.controller('changePasswordController', ['$scope', 'userService', 
    function ($scope, userService) {
        
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
        
}]);
