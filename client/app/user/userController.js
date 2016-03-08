/*global app*/
'use strict';

app.controller('userController', ['$scope', '$route', 'userService', '$location', 'helperValidator',
    function ($scope, $route, userService, $location, helperValidator) {
        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;

    $scope.user = {};
    $scope.errors = {};
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getUser();
    } 

    function getUser() {
        userService.getById($route.current.params.id).then(function (data) {
            $scope.user = data;
        })
        .catch(function (err) {
            if(err.status !== 401) {
                alert(JSON.stringify(err, null, 4));
            }
        });
    }
   
    $scope.create = function (form) {  
        validateForm($scope, form);
        if (form.$invalid) return false;
        
        userService.create($scope.user)
            .then(function (data) {
                $scope.goBack(); // it comes from rootScope
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            }) 
    };    

    $scope.update = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            userService.update($scope.user)
                .then(function (data) {
                    $location.path('/admin/users');
                    //Logger.info("Widget created successfully");
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    };
    
    function validateForm($scope, form){ 
        var entity = 'user'; 
        helperValidator.setAllFildsAsValid(form);
        
        // fields
        helperValidator.required50($scope, form, entity, 'name');
        helperValidator.requiredEmail($scope, form, entity, 'email');
    }     

}]);