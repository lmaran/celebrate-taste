'use strict';

app.controller('ordersController', ['$scope', '$location', 'orderService', 'modalService', 'helperService', '$uibModal',
    function ($scope, $location, orderService, modalService, helperService, $uibModal) {
        
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
    
    $scope.openCreateOrder = function () {
        var modalInstance = $uibModal.open({
            animation:false,
            templateUrl: 'app/order/createOrderTpl.html',
            controller: 'createOrderTplController'
        });

        modalInstance.result.then(function (dataFromModal) { // js date object
            var dateAsString = helperService.getStringFromDate(dataFromModal); // "yyyy-mm-dd" 
            $scope.create(dateAsString);
        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });       
    }    

    $scope.create = function (dateAsString) {
        //$location.path('/admin/orders/create');
        
        var order={date:dateAsString};
        orderService.create(order)
            .then(function (data) {
                //$location.path('/admin/orders');
                $scope.refresh();
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    //helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            })         
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