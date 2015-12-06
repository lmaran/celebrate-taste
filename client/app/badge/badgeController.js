/*global app*/
'use strict';

app.controller('badgeController', ['$scope', '$window', '$route', 'badgeService', '$location', 
    function ($scope, $window, $route, badgeService, $location) {
        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.badge = {};
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getbadge();
    } 

    function getbadge() {
        badgeService.getById($route.current.params.id).then(function (data) {
            $scope.badge = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }

    $scope.create = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            //alert(JSON.stringify($scope.badge));
            badgeService.create($scope.badge)
                .then(function (data) {
                    $location.path('/admin/badges');
                    //Logger.info("Widget created successfully");
                })
                .catch(function (err) {
                    //alert(JSON.stringify(err.data, null, 4));                    
                    //$scope.errors.other = err.data.message;
                    err = err.data;
                    $scope.errors = {};
                    //console.log(err.data);
                    
                    // Update validity of form fields that match the mongoose errors
                    angular.forEach(err.errors, function(error, field) {
                        form[field].$setValidity('mongoose', false);
                        $scope.errors[field] = error.message;
                    });
                });
        }
    };

    $scope.update = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            //alert(JSON.stringify($scope.badge));
            badgeService.update($scope.badge)
                .then(function (data) {
                    $location.path('/admin/badges');
                    //Logger.info("Widget created successfully");
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    };

    $scope.cancel = function () {
        //$location.path('/widgets')
        $window.history.back();
    }

}]);