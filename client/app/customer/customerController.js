/*global app*/
'use strict';

app.controller('customerController', ['$scope', '$window', '$route', 'customerService', '$location', function ($scope, $window, $route, customerService, $location) {
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;

    $scope.customer = {};
   
    if ($scope.isEditMode) {
        init(); 
    }

    function init() {
        getCustomer();
    } 

    function getCustomer() {
        customerService.getById($route.current.params.id).then(function (data) {
            $scope.customer = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

    $scope.create = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            //alert(JSON.stringify($scope.customer));
            customerService.create($scope.customer)
                .then(function (data) {
                    $location.path('/customers');
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
            //alert(JSON.stringify($scope.customer));
            customerService.update($scope.customer)
                .then(function (data) {
                    $location.path('/customers');
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