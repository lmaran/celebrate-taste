/* global _ */
'use strict';

app.controller('menusController', ['$scope', '$location', 'menuService', 'modalService', 'dayTimeService', '$uibModal',
    function ($scope, $location, menuService, modalService, dayTimeService, $uibModal) {
        
    $scope.menus = [];
    $scope.errors = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.deleteMenuItem = function (item) {
        var modalOptions = {
            bodyDetails: item.name,           
        };
        
        modalService.confirm(modalOptions).then(function (result) {
            // get the index for selected item
            for (var i in $scope.menus) {
                if ($scope.menus[i]._id === item._id) break;
            }

            menuService.delete(item._id).then(function () {
                $scope.menus.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };
    
    $scope.delete = function (item) {
        var d = dayTimeService.getDateFromString(item.menuDate);
        var friendlyDate = dayTimeService.getFriendlyDate(d).dayAsString + ', ' + dayTimeService.getFriendlyDate(d).dayOfMonth + ' ' + dayTimeService.getFriendlyDate(d).monthAsString + ' ' + dayTimeService.getFriendlyDate(d).year;
        var modalOptions = {
            bodyDetails: 'Meniul de ' + friendlyDate      
        };
        
        modalService.confirm(modalOptions).then(function (result) {
            // get the index for selected item
            for (var i in $scope.menus) {
                if ($scope.menus[i]._id === item._id) break;
            }

            menuService.delete(item._id).then(function () {
                $scope.menus.splice(i, 1);
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
    
    $scope.friendlyDate = function(dateAsString){ // yyyy-mm-dd
        var date = dayTimeService.getDateFromString(dateAsString);
        var fDay = dayTimeService.getFriendlyDate(date);
        
        return  {
            dayAsString: fDay.dayAsString, // Joi
            dayOfMonth: fDay.dayOfMonth, // 07
            monthAsString: fDay.monthAsString, // Aprilie
            year: fDay.year // 2015
        };
    }

    function init() {
        menuService.getAll().then(function (data) {
            $scope.menus = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

}]);