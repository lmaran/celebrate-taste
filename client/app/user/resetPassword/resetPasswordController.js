'use strict';

app.controller('resetPasswordController', ['$scope', 'userService', '$window', 
    function ($scope, userService, $window) {
        
    $scope.errors = {};

    $scope.resetPassword = function(form) {
        $scope.submitted = true;
        //if(form.$valid) {
            // Auth.resetPassword($scope.user.email)
            //     .then( function() {
            //         $scope.message = 'Parola a fost schimbata cu succes.';
            //     })
            //     .catch( function() {
            //         form.password.$setValidity('mongoose', false);
            //         $scope.errors.other = 'Parola incorecta';
            //         $scope.message = '';
            //     });
        //}
	};
    
    $scope.cancel = function () {
        $window.history.back();
    }
}]);
