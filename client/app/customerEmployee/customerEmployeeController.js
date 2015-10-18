/*global app*/
'use strict';

app.controller('customerEmployeeController', ['$scope', '$window', '$route', 'customerEmployeeService', '$location', 
    function ($scope, $window, $route, customerEmployeeService, $location) {
        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;

    $scope.customerEmployee = {};
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getCustomerEmployee();
    } 

    function getCustomerEmployee() {
        customerEmployeeService.getById($route.current.params.id).then(function (data) {
            $scope.customerEmployee = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

    $scope.create = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            //alert(JSON.stringify($scope.customerEmployee));
            customerEmployeeService.create($scope.customerEmployee)
                .then(function (data) {
                    $location.path('/customerEmployees');
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
            //alert(JSON.stringify($scope.customerEmployee));
            customerEmployeeService.update($scope.customerEmployee)
                .then(function (data) {
                    $location.path('/customerEmployees');
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