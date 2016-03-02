/*global app*/
/* global _ */
'use strict';

app.controller('menuItemController', ['$scope', '$route', 'menuService', 'helperService',
    function ($scope, $route, menuService, helperService) {
        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;

    $scope.menu = {};
    $scope.dish = {};
    
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getMenu();
    } 

    function getMenu() {
        menuService.getById($route.current.params.menuId).then(function (data) {
            $scope.menu = data;
            $scope.menuDateAsString = dt($scope.menu.menuDate).dateAsShortString;
            $scope.dish = _.find(data.dishes, '_id', $route.current.params.dishId);
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

//     $scope.create = function (form) {
//         $scope.submitted = true;
//         if (form.$valid) {
//             //alert(JSON.stringify($scope.dish));
//             dishService.create($scope.dish)
//                 .then(function (data) {
//                     //$location.path('/dishes');
//                     $scope.goBack(); // it comes from rootScope
//                     //Logger.info("Widget created successfully");
//                 })
//                 .catch(function (err) {
//                     alert(JSON.stringify(err.data, null, 4));
//                 });
//         }
//     };
// 
    $scope.update = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            //alert(JSON.stringify($scope.dish));
            menuService.update($scope.menu)
                .then(function (data) {
                    //$location.path('/dishes');
                    $scope.goBack(); // it comes from rootScope
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    };
    
    function dt(dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    }  

}]);