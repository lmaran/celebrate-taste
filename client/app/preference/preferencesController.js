'use strict';

app.controller('preferencesController', ['$scope', '$location', 'preferenceService', 'modalService',
    function ($scope, $location, preferenceService, modalService) {
        
    $scope.preferences = [];
    $scope.errors = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.delete = function (item) {

        var modalOptions = {
            bodyDetails: item.name,           
        };
        
        modalService.confirm(modalOptions).then(function (result) {
        
            // get the index for selected item
            var i = 0;
            for (i in $scope.preferences) {
                if ($scope.preferences[i]._id === item._id) break;
            }

            preferenceService.delete(item._id).then(function () {
                $scope.preferences.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };

    $scope.create = function () {
        $location.path('/admin/preferences/create');
    }

    $scope.refresh = function () {
        init();
    };

    function init() {
        preferenceService.getAll().then(function (data) {
            $scope.preferences = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

}]);