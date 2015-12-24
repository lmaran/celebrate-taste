/*global app*/
'use strict';

app.controller('orderDetailController', ['$scope', '$window', '$route', 'orderDetailService', '$location', 'helperValidator',
    function ($scope, $window, $route, orderDetailService, $location, helperValidator) {
        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.orderDetail = {};
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getorderDetail();
    } 

    function getorderDetail() {
        orderDetailService.getById($route.current.params.id).then(function (data) {
            $scope.orderDetail = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        })
    }   

    $scope.create = function (form) { 
        validateForm($scope, form);
        if (form.$invalid) return false;
        
        orderDetailService.create($scope.orderDetail)
            .then(function (data) {
                $location.path('/admin/orderDetails');
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
            
        orderDetailService.update($scope.orderDetail)
            .then(function (data) {
                $location.path('/admin/orderDetails');
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
        var entity = 'orderDetail'; 
        helperValidator.setAllFildsAsValid(form);
        
        // fields
        helperValidator.required50($scope, form, entity, 'code');
        helperValidator.required50($scope, form, entity, 'name');         
    }    

}])