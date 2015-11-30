'use strict';

app.controller('usersController', ['$scope', '$http', 'userService', 'modalService', 
    function ($scope, $http, userService, modalService) {

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();
    
    function init(){
        userService.getAll().then(function(data){
            $scope.users = data;
        });
    }

    $scope.delete = function(user) {
        var modalOptions = {
            bodyDetails: user.name,           
        };
        
        modalService.confirm(modalOptions).then(function (result) {
            userService.delete(user._id);
            angular.forEach($scope.users, function(u, i) {
                if (u === user) {
                    $scope.users.splice(i, 1);
                }
            });
        });
    };
    
    $scope.refresh = function () {
        init();
    };
}]);
