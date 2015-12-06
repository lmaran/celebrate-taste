'use strict';

app.controller('badgesController', ['$scope', '$location', 'badgeService', 'modalService',
    function ($scope, $location, badgeService, modalService) {
        
    $scope.badges = [];
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
            for (i in $scope.badges) {
                if ($scope.badges[i]._id === item._id) break;
            }

            badgeService.delete(item._id).then(function () {
                $scope.badges.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };

    $scope.create = function () {
        $location.path('/admin/badges/create');
    }

    $scope.refresh = function () {
        init();
    };

    function init() {
        badgeService.getAll().then(function (data) {
            $scope.badges = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

}]);