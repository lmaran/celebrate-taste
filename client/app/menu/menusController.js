﻿'use strict';

app.controller('menusController', ['$scope', '$location', 'menuService', 'modalService', 'dayTimeService',
    function ($scope, $location, menuService, modalService, dayTimeService) {
        
    $scope.menus = [];
    $scope.errors = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.delete = function (item) {

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

    $scope.create = function () {
        $location.path('/menus/create');
    }

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