/*global app*/
'use strict';

app.controller('customerEmployeeController', ['$scope', '$route', 'customerEmployeeService', '$location', '$q', 'helperValidator', 
    function ($scope, $route, customerEmployeeService, $location, $q, helperValidator) {
       
    var promiseToGetCustomerEmployee;        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    
    $scope.isActiveOptions = [{id: true, name: 'Da'},{id: false, name: 'Nu'}];
    $scope.customerEmployee = {};
    $scope.errors = {};
   
    if ($scope.isEditMode) {  
        init(); 
    }

    function init() {
        getCustomerEmployee();          
    } 

    function getCustomerEmployee() {
        promiseToGetCustomerEmployee = customerEmployeeService.getById($route.current.params.id).then(function (data) {
            $scope.customerEmployee = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }        

    $scope.create = function (form) {  
        validateForm($scope, form);
        if (form.$invalid) return false;
        
        customerEmployeeService.create($scope.customerEmployee)
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
        if($scope.customerEmployee.askForNotification && !$scope.customerEmployee.email){
            alert('Ai ales sa notifici clientul dar lipseste adresa de email!');
            return false;
        };
          
        validateForm($scope, form);
        if (form.$invalid) return false;
            
        customerEmployeeService.update($scope.customerEmployee)
            .then(function (data) {
                $scope.goBack(); // it comes from rootScope
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            });
    };
    
    function validateForm($scope, form){ 
        var entity = 'customerEmployee'; 
        helperValidator.setAllFildsAsValid(form);
        
        // fields
        helperValidator.required50($scope, form, entity, 'name');
        helperValidator.optionalEmail($scope, form, entity, 'email');
    }     

}]);