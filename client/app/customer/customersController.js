'use strict';

app.controller('customersController', ['$scope', '$location', 'customerService', function ($scope, $location, customerService) {
    $scope.customers = [];
    $scope.errors = {};

    init();

    $scope.delete = function (item) {

        //dialogService.confirm('Are you sure you want to delete this item?', item.name).then(function () {

            // get the index for selected item
            for (var i in $scope.customers) {
                if ($scope.customers[i]._id === item._id) break;
            }

            customerService.delete(item._id).then(function () {
                $scope.customers.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        //});
    };

    $scope.create = function () {
        $location.path('/customers/create');
    }

    $scope.refresh = function () {
        init();
    };

    function init() {
        customerService.getAll().then(function (data) {
            $scope.customers = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

}]);