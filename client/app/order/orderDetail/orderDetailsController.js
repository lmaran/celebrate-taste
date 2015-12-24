'use strict';

app.controller('orderDetailsController', ['$scope', '$location', 'orderDetailService', 'modalService',
    function ($scope, $location, orderDetailService, modalService) {
        
    $scope.orderDetails = [];
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
            for (i in $scope.orderDetails) {
                if ($scope.orderDetails[i]._id === item._id) break;
            }

            orderDetailService.delete(item._id).then(function () {
                $scope.orderDetails.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };

    $scope.create = function () {
        $location.path('/admin/orderDetails/create');
    }

    $scope.refresh = function () {
        init();
    };

    function init() {
        orderDetailService.getAll().then(function (data) {
            $scope.orderDetails = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

}]);