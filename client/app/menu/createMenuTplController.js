'use strict';

app.controller('createMenuTplController', ['$scope', '$uibModalInstance', 'dataToModal', 'helperService', 
	function ($scope, $uibModalInstance, dataToModal, helperService) {

    $scope.menuDate = helperService.getDateFromString(dataToModal); // "yyyy-mm-dd"
 
    $scope.menuDate.setDate($scope.menuDate.getDate() + 1); // increment date

    $scope.ok = function () {
        $uibModalInstance.close($scope.menuDate);        
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