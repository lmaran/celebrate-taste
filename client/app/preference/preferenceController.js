/*global app*/
'use strict';

app.controller('preferenceController', ['$scope', '$window', '$route', 'preferenceService', '$location', 'helperValidator',
    function ($scope, $window, $route, preferenceService, $location, helperValidator) {
        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.preference = {};
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getpreference();
    } 

    function getpreference() {
        preferenceService.getById($route.current.params.id).then(function (data) {
            $scope.preference = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        })
    }   

    $scope.create = function (form) { 
        validateForm($scope, form);
        if (form.$invalid) return false;
        
        preferenceService.create($scope.preference)
            .then(function (data) {
                $location.path('/admin/preferences');
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
            
        preferenceService.update($scope.preference)
            .then(function (data) {
                $location.path('/admin/preferences');
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
        var entity = 'preference'; 
        helperValidator.setAllFildsAsValid(form);
        
        // fields
        helperValidator.required50($scope, form, entity, 'code');
        helperValidator.required50($scope, form, entity, 'name');         
    }    

}])