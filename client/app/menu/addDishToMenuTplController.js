'use strict';

app.controller('addDishToMenuTplController', ['$scope', '$uibModalInstance', 'dataToModal', 'helperService', 'dishService', 
	function ($scope, $uibModalInstance, dataToModal, helperService, dishService) {

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
            if(err.status !== 401) {
                alert(JSON.stringify(err, null, 4));
            }
        });
    }    
    
    init();
}]);