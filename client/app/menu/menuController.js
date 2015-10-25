/*global app*/
'use strict';

app.controller('menuController', ['$scope', '$window', '$route', 'menuService', '$location', 
    function ($scope, $window, $route, menuService, $location) {
        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;

    $scope.menu = {};
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getCustomer();
    } 

    function getCustomer() {
        menuService.getById($route.current.params.id).then(function (data) {
            $scope.menu = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

    $scope.create = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            //alert(JSON.stringify($scope.menu));
            menuService.create($scope.menu)
                .then(function (data) {
                    $location.path('/menus');          
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
            //alert(JSON.stringify($scope.menu));
            menuService.update($scope.menu)
                .then(function (data) {
                    $location.path('/menus');
                    //Logger.info("Widget created successfully");
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    };

    $scope.cancel = function () {
        //$location.path('/widgets')
        $window.history.back();
    }

}]);