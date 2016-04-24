'use strict';
 
app.controller('homeController', ['$scope', 'userService',
    function ($scope, userService) {

    $scope.isAdmin = userService.isAdmin;
}]);