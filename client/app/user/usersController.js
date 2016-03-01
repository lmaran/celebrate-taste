'use strict';

app.controller('usersController', ['$scope', '$http', 'userService', 'modalService', '$location',
    function ($scope, $http, userService, modalService, $location) {

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();
    
    function init(){
        userService.getAll().then(function(data){
            $scope.users = data;
        });
    }
    
    $scope.create = function () {
        $location.path('/admin/users/create');
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
    
    $scope.mySearch = function (item) {
        var isMatch = false;
        if ($scope.search) {
            // search by user name or email
            if (new RegExp($scope.search, 'i').test(item.name) || new RegExp($scope.search, 'i').test(item.email)) {
                isMatch = true;
            }
        } else {
            // if nothing is entered, return all posts
            isMatch = true;
        }
        return isMatch;
    };    
}]);
