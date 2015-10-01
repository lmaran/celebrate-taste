﻿'use strict';

app.controller('dishesController', ['$scope', '$location', 'dishService', function ($scope, $location, dishService) {
    $scope.dishes = [];
    $scope.errors = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.delete = function (item) {

        //dialogService.confirm('Are you sure you want to delete this item?', item.name).then(function () {

            // get the index for selected item
            for (var i in $scope.dishes) {
                if ($scope.dishes[i]._id === item._id) break;
            }

            dishService.delete(item._id).then(function () {
                $scope.dishes.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        //});
    };

    $scope.create = function () {
        $location.path('/dishes/create');
    }

    $scope.refresh = function () {
        init();
    };

    function init() {
        dishService.getAll().then(function (data) {
            $scope.dishes = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

}]);