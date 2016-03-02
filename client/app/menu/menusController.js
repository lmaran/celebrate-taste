/* global _ */
'use strict';

app.controller('menusController', ['$scope', '$location', 'menuService', 'modalService', 'helperService', '$uibModal',
    function ($scope, $location, menuService, modalService, helperService, $uibModal) {
        
    $scope.menus = [];
    $scope.errors = {};
    
    $scope.friendlyDate = function (dateAsString) { // yyyy-mm-dd
        return helperService.getStringFromString(dateAsString);
    }     

    function init() {
        menuService.getActiveMenus().then(function (data) {
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
                return item._id === dish._id;
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
        var lastMenu = _.chain($scope.menus)
            .sortBy('menuDate')
            .last()
            .value();
            
        var lastMenuDate = (lastMenu && lastMenu.menuDate) || helperService.getStringFromDate(new Date());

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
            var dateAsString = helperService.getStringFromDate(dataFromModal); // "yyyy-mm-dd" 
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
        $location.path('/admin/menus/' + menu._id + '/add/');
    }  

}]);