'use strict';

app.controller('deliveryLogsController', ['$scope', 'deliveryLogService', 'helperService',
    function ($scope, deliveryLogService, helperService) {
    
    $scope.deliveryLogs = [];
    init();

    $scope.refresh = function () {
        init();
    };

    function init() {
        deliveryLogService.getAll().then(function (data) {
            $scope.deliveryLogs = data;
        })
        .catch(function (err) {
            if(err.status !== 401) {
                alert(JSON.stringify(err, null, 4));
            }
        });
    }
    
    $scope.dt = function (dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    }    

}]);