/*global app*/
'use strict';

app.controller('userController', ['$scope', '$window', '$route', 'userService', '$location', 
    function ($scope, $window, $route, userService, $location) {
        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;

    $scope.user = {};
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getUser();
    } 

    function getUser() {
        userService.getById($route.current.params.id).then(function (data) {
            $scope.user = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

    $scope.create = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            userService.create($scope.user)
                .then(function (data) {
                    $location.path('/admin/users');
                    //Logger.info("Widget created successfully");
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    };

    $scope.update = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            userService.update($scope.user)
                .then(function (data) {
                    $location.path('/admin/users');
                    //Logger.info("Widget created successfully");
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    };

    $scope.cancel = function () {
        //$location.path('/admin/users')
        $window.history.back();
    }

}]);