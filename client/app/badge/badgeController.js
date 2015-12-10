/*global app*/
'use strict';

app.controller('badgeController', ['$scope', '$window', '$route', 'badgeService', '$location', 'helperService',
    function ($scope, $window, $route, badgeService, $location, helperService) {
        
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
        })
    }  

    $scope.create = function (form) {       
        $scope.submitted = true;
        if (form.$valid || $scope.areServerErrors) {
            badgeService.create($scope.badge)
                .then(function (data) {
                    $location.path('/admin/badges');
                })
                .catch(function (err) {
                    if(err.data.errors){                   
                        helperService.setAllFildsAsValid(form);                       

                        // Update validity of form fields that match the server errors                        
                        angular.forEach(err.data.errors, function(item, idx) {
                            form[item.field].$setValidity('serverMessage', false);
                            $scope.errors[item.field] = item.msg;                       
                        });                        
                                        
                        $scope.areServerErrors = true;
                    } else{
                        alert(JSON.stringify(err.data, null, 4)); 
                    }
                })     
        }
    }

    $scope.update = function (form) {
        $scope.submitted = true;
        if (form.$valid || $scope.areServerErrors) {
            badgeService.update($scope.badge)
                .then(function (data) {
                    $location.path('/admin/badges');
                })
                .catch(function (err) {
                    if(err.data.errors){                   
                        helperService.setAllFildsAsValid(form);                       

                        // Update validity of form fields that match the server errors                        
                        angular.forEach(err.data.errors, function(item, idx) {
                            form[item.field].$setValidity('serverMessage', false);
                            $scope.errors[item.field] = item.msg;                       
                        });                        
                                        
                        $scope.areServerErrors = true;
                    } else{
                        alert(JSON.stringify(err.data, null, 4)); 
                    }
                });
        }
    };

    $scope.cancel = function () {
        //$location.path('/widgets')
        $window.history.back();
    }

}])