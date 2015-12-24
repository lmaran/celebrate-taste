'use strict';

app.controller('ordersController', ['$scope', '$location', 'orderService', 'modalService',
    function ($scope, $location, orderService, modalService) {
        
    $scope.orders = [];
    $scope.errors = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.delete = function (item) {

        var modalOptions = {
            bodyDetails: item.name,           
        };
        
        modalService.confirm(modalOptions).then(function (result) {
        
            // get the index for selected item
            var i = 0;
            for (i in $scope.orders) {
                if ($scope.orders[i]._id === item._id) break;
            }

            orderService.delete(item._id).then(function () {
                $scope.orders.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };

    $scope.create = function () {
        $location.path('/admin/orders/create');
    }

    $scope.refresh = function () {
        init();
    };

    function init() {
        orderService.getAll().then(function (data) {
            $scope.orders = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

}]);