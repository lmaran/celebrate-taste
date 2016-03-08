/*global app*/
'use strict';

app.controller('dishController', ['$scope', '$route', 'dishService', '$location', 
    function ($scope, $route, dishService, $location) {
    
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;

    $scope.dish = {};
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getCustomer();
    } 

    function getCustomer() {
        dishService.getById($route.current.params.id).then(function (data) {
            $scope.dish = data;
        })
        .catch(function (err) {
            if(err.status !== 401) {
                alert(JSON.stringify(err, null, 4));
            }
        });
    }

    $scope.create = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            //alert(JSON.stringify($scope.dish));
            dishService.create($scope.dish)
                .then(function (data) {
                    //$location.path('/dishes');
                    $scope.goBack(); // it comes from rootScope
                    //Logger.info("Dish created successfully");
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    };

    $scope.update = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            //alert(JSON.stringify($scope.dish));
            dishService.update($scope.dish)
                .then(function (data) {
                    //$location.path('/dishes');
                    $scope.goBack(); // it comes from rootScope
                    //Logger.info("Widget created successfully");
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    };

}]);