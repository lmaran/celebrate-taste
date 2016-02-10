'use strict';

app.controller('openDeliveryLineTplController', ['$scope', '$uibModalInstance', 'helperService', 'deliveryService', 'helperValidator', '$q', 'orderService', 'orderLineService', 'dataToModal',
	function ($scope, $uibModalInstance, helperService, deliveryService, helperValidator, $q, orderService, orderLineService, dataToModal) {

    $scope.errors = {};

    $scope.orderLine = dataToModal.orderLine; 
    $scope.option1 = dataToModal.option1;
    $scope.option2 = dataToModal.option2; 

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    
    $scope.update = function (form) {
        $scope.orderLine.status = 'completed';
        $scope.orderLine.deliveryDate = new Date(); 
                     
        orderLineService.update($scope.orderLine)
            .then(function (data) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                alert(JSON.stringify(err.data, null, 4)); 
            })                     
    }; 
    
    // return an orderLine back to open status
    $scope.revoke = function () { 
        $scope.orderLine.status = 'open';
        delete $scope.orderLine.deliveryDate;
                
        orderLineService.update($scope.orderLine)
            .then(function (data) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                alert(JSON.stringify(err.data, null, 4)); 
            })                    
    };        
    
}]);