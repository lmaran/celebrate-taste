﻿/* global _ */
'use strict';

app.controller('menusController', ['$scope', '$location', 'menuService', 'modalService', 'dayTimeService', '$uibModal',
    function ($scope, $location, menuService, modalService, dayTimeService, $uibModal) {
        
    $scope.menus = [];
    $scope.errors = {};
    
    $scope.friendlyDate = function (dateAsString) { // yyyy-mm-dd
        return dayTimeService.getStringFromString(dateAsString);
    }     

    function init() {
        menuService.getAll().then(function (data) {
            $scope.menus = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }
        
    init();

    $scope.deleteDishFromMenu = function (dish, menu) {
        var modalOptions = {
            bodyDetails: dish.name,
        };

        modalService.confirm(modalOptions).then(function (result) {
            _.remove(menu.dishes, function (item) {
                return item.name === dish.name;
            });

            menuService.update(menu)
                .then(function (data) {
                    $scope.refresh();
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });

        });
    };  
    
    $scope.deleteMenu = function (item) {
        var modalOptions = {
            bodyDetails: 'Meniul de ' + $scope.friendlyDate(item.menuDate)     
        }; 
        
        modalService.confirm(modalOptions).then(function (result) {
            menuService.delete(item._id).then(function () {
                $scope.refresh();
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };    

    $scope.openCreateMenu = function () {
        var lastMenuDate = _.chain($scope.menus)
            .sortBy('menuDate')
            .last()
            .value()
            .menuDate;

        var modalInstance = $uibModal.open({
            animation:false,
            templateUrl: 'app/menu/createMenuTpl.html',
            controller: 'createMenuTplController',
            resolve: {
                dataToModal: function () {
                    return lastMenuDate;
                }
            }
        });

        modalInstance.result.then(function (dataFromModal) { // js date object
            var dateAsString = dayTimeService.getStringFromDate(dataFromModal); // "yyyy-mm-dd" 
            $scope.create(dateAsString);
        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });       
    }
    
    $scope.create = function (dateAsString) {
        var menu={ menuDate:dateAsString };
        menuService.create(menu)
            .then(function (data) {
                $scope.refresh();
            })
            .catch(function (err) {
                alert(JSON.stringify(err.data, null, 4));
            });
    };    

    $scope.refresh = function () {
        init();
    };

    $scope.addToMenu = function (menu) {       
        $location.path('/menus/' + menu._id + '/add/');
    }  

}]);