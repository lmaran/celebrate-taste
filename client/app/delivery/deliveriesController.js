'use strict';

app.controller('deliveriesController', ['$scope', '$location', 'deliveryService', 'modalService', 'helperService', '$uibModal',
    function ($scope, $location, deliveryService, modalService, helperService, $uibModal) {
        
    $scope.deliveries = [];
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
            for (i in $scope.deliveries) {
                if ($scope.deliveries[i]._id === item._id) break;
            }

            deliveryService.delete(item._id).then(function () {
                $scope.deliveries.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };
    
    $scope.openCreateDelivery = function () {
        var modalInstance = $uibModal.open({
            animation:false,
            templateUrl: 'app/delivery/createDeliveryTpl.html',
            controller: 'createDeliveryTplController'
        });

        modalInstance.result.then(function () { // "yyyy-mm-dd" 
            $scope.refresh();
        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });       
    }    


    $scope.refresh = function () {
        init();
    };  

    function init() {
        deliveryService.getAll().then(function (data) {
            $scope.deliveries = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }
    
    $scope.dt = function (dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    }    

}]);