'use strict';

app.controller('menusController', ['$scope', '$location', 'menuService', function ($scope, $location, menuService) {
    $scope.menus = [];
    $scope.errors = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.delete = function (item) {

        //dialogService.confirm('Are you sure you want to delete this item?', item.name).then(function () {

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

        //});
    };

    $scope.create = function () {
        $location.path('/menus/create');
    }

    $scope.refresh = function () {
        init();
    };

    function init() {
        menuService.getAll().then(function (data) {
            $scope.menus = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

}]);