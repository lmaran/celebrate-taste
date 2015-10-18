'use strict';

app.controller('customerEmployeesController', ['$scope', '$location', 'customerEmployeeService', 'modalService', 
    function ($scope, $location, customerEmployeeService, modalService) {
    
    $scope.customerEmployees = [];
    $scope.errors = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.delete = function (item) {

        var modalOptions = {
            bodyDetails: item.name,           
        };
        
        modalService.confirm({}, modalOptions).then(function (result) {

            // get the index for selected item
            for (var i in $scope.customerEmployees) {
                if ($scope.customerEmployees[i]._id === item._id) break;
            }

            customerEmployeeService.delete(item._id).then(function () {
                $scope.customerEmployees.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };

    $scope.create = function () {
        $location.path('/customerEmployees/create');
    }

    $scope.refresh = function () {
        init();
    };

    function init() {
        customerEmployeeService.getAll().then(function (data) {
            $scope.customerEmployees = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

}]);