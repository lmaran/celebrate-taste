/*global app*/
'use strict';

app.controller('badgeController', ['$scope', '$window', '$route', 'badgeService', '$location', 'helperValidator',
    function ($scope, $window, $route, badgeService, $location, helperValidator) {
        
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
        validateForm($scope, form);
        if (form.$invalid) return false;
        
        badgeService.create($scope.badge)
            .then(function (data) {
                $location.path('/admin/badges');
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            })     
    }

    $scope.update = function (form) {
        validateForm($scope, form);
        if (form.$invalid) return false;
            
        badgeService.update($scope.badge)
            .then(function (data) {
                $location.path('/admin/badges');
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            });
    };

    $scope.cancel = function () {
        $window.history.back();
    }
    
    function validateForm($scope, form){ 
        var entity = 'badge'; 
        helperValidator.required50($scope, form, entity, 'code');
        helperValidator.required50($scope, form, entity, 'name');         
    }    

}])