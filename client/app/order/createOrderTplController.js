'use strict';

app.controller('createOrderTplController', ['$scope', '$uibModalInstance', 'helperService', 'orderService',
	function ($scope, $uibModalInstance, helperService, orderService) {

    // if(dataToModal && dataToModal.length === 10)
    //     $scope.orderDate = helperService.getDateFromString(dataToModal); // "yyyy-mm-dd"
    // else
        $scope.orderDate = new Date();
        
    //$scope.orderDate.setDate($scope.orderDate.getDate() + 1); // increment date
    
    $scope.ok = function () {
        orderService.getAll().then(function (data) {
            $scope.orders = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
        
        $uibModalInstance.close($scope.orderDate);        
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    
    
   // ****** calendar settings ****** 
    
    $scope.dateOptions = {
        startingDay: 1,
    };

    $scope.isOpen = false;
    $scope.open = function () {
        $scope.isOpen = true;
    };   
 
    
}]);