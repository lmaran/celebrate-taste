/*global app*/
'use strict';

app.controller('orderLineController', ['$scope', '$route', 'orderLineService', '$location', 'helperValidator', 'customerEmployeeService', 'helperService',
    function ($scope, $route, orderLineService, $location, helperValidator, customerEmployeeService, helperService) {

    $scope.orderId = $route.current.params.id; 

    var searchObject = $location.search();
    if(searchObject.orderDate){
        $scope.orderDate = searchObject.orderDate;
        $scope.orderDateAsString = dt(searchObject.orderDate).dateAsShortString;
    }
           
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.orderLine = {};
    
    
    $scope.customerEmployees = [];
    $scope.eatSeriesList = [
        {name: 'Seria 1'},
        {name: 'Seria 2'},
        {name: 'Seria 3'}
    ];
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }
    
    getCustomerEmployees();

    function init() {
        getorderLine();
    } 

    function getorderLine() {
        orderLineService.getById($scope.orderId).then(function (data) {
            $scope.orderLine = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        })
    }  
    
    function getCustomerEmployees(){
        customerEmployeeService.getAll().then(function (data) {
            $scope.customerEmployees = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }     

    $scope.create = function (form) { 
        validateForm($scope, form);
        if (form.$invalid) return false;
        
        $scope.orderLine.orderId = $scope.orderId;
        $scope.orderLine.orderDate = $scope.orderDate;
        
        orderLineService.create($scope.orderId, $scope.orderLine)
            .then(function (data) {
                $location.path('/admin/orders/' + $scope.orderId);
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
            
        orderLineService.update($scope.orderLine)
            .then(function (data) {
                $location.path('/admin/orderLines');
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
        var entity = 'orderLine'; 
        helperValidator.setAllFildsAsValid(form);
        
        // fields
        helperValidator.required50($scope, form, entity, 'employeeName');
        helperValidator.required50($scope, form, entity, 'eatSeries');         
    }
    
    function dt(dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    }            

}])