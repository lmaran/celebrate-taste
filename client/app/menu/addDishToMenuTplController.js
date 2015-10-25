'use strict';

app.controller('addDishToMenuTplController', ['$scope', '$uibModalInstance', 'dataToModal', 'dayTimeService', 'dishService', 
	function ($scope, $uibModalInstance, dataToModal, dayTimeService, dishService) {

    $scope.dishes = [];
    
    $scope.ok = function () {
        $uibModalInstance.close('aaa');        
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    
    function init() {
        dishService.getAll().then(function (data) {
            $scope.dishes = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }    
    
    init();
}]);