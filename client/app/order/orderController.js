/*global app*/
'use strict';

app.controller('orderController', ['$scope', '$window', '$route', 'orderService', '$location', 'helperValidator',
    function ($scope, $window, $route, orderService, $location, helperValidator) {
        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.order = {};
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getorder();
    } 

    function getorder() {
        orderService.getById($route.current.params.id).then(function (data) {
            $scope.order = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        })
    }   

    $scope.create = function (form) { 
        // validateForm($scope, form);
        // if (form.$invalid) return false;
        
        orderService.create($scope.order)
            .then(function (data) {
                $location.path('/admin/orders');
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
        // validateForm($scope, form);
        // if (form.$invalid) return false;
            
        orderService.update($scope.order)
            .then(function (data) {
                $location.path('/admin/orders');
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
    
    // function validateForm($scope, form){ 
    //     var entity = 'order'; 
    //     helperValidator.setAllFildsAsValid(form);
    //     
    //     // fields
    //     helperValidator.required50($scope, form, entity, 'code');
    //     helperValidator.required50($scope, form, entity, 'name');         
    // }    

}])