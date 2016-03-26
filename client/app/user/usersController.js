'use strict';

app.controller('usersController', ['$scope', '$http', 'userService', 'modalService', '$location', '$window',
    function ($scope, $http, userService, modalService, $location, $window) {

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();
    
    function init(){
        userService.getAll().then(function(data){
            data.forEach(function(user){
                if(user.activationToken){
                    user.status = 'asteapta activare';
                } else{
                    user.status = 'activ';
                }
                // } else if(user.isActive){
                //     user.status = 'activ';
                // } else if (!user.isActive){
                //     user.status = 'inactiv';
                // }
            });
            $scope.users = data;
            
        })
        .catch(function (err) {
            if(err.status !== 401) {
                alert(JSON.stringify(err, null, 4));
            }
        });        
    }
    
    $scope.refresh = function () {
        init();
    };    
    
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
            
            if(userService.getCurrentUser().name === user.name){
                userService.logout();
                $window.location.href = '/'; //server-side home page             
            }
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
