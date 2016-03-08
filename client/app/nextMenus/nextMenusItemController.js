/* global _ */

'use strict';

app.controller('nextMenusItemController', ['$scope', '$route', 'menuService', 
    function ($scope, $route, menuService) {

    $scope.menu = {};
    $scope.dish = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
    init(); 

    function init() {
        getMenuItem();
    } 

    function getMenuItem() {
        menuService.getById($route.current.params.menuId).then(function (data) {
            $scope.menu = data;
            $scope.dish = _.find(data.dishes, '_id', $route.current.params.dishId);
        })
        .catch(function (err) {
            if(err.status !== 401) {
                alert(JSON.stringify(err, null, 4));
            }
        });
    }

}]);