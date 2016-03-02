'use strict';

app.controller('nextMenusController', ['$scope', '$location', 'menuService', 'helperService',
    function ($scope, $location, menuService, helperService) {
        
    $scope.menus = [];
    $scope.errors = {};
    
    $scope.friendlyDate = function (dateAsString) { // yyyy-mm-dd
        return helperService.getStringFromString(dateAsString);
    }     

    function init() {
        menuService.getNextMenus().then(function (data) {
            $scope.menus = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }
        
    init();

}]);