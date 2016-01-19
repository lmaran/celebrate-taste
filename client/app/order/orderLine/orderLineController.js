/*global app*/
'use strict';

app.controller('orderLineController', ['$scope', '$route', 'orderLineService', '$location', 'helperValidator', 'customerEmployeeService', 'helperService',
    function ($scope, $route, orderLineService, $location, helperValidator, customerEmployeeService, helperService) {

    $scope.orderId = $route.current.params.id; 
    $scope.orderLineId = $route.current.params.id2; 
    
    $scope.obj = {}; //just a wrapper

    var searchObject = $location.search();
          
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
    } else{ // create
        if(searchObject.orderDate){
            $scope.orderLine.orderDate = searchObject.orderDate;
            $scope.orderLine.orderId = $scope.orderId;
            $scope.orderDateAsString = dt(searchObject.orderDate).dateAsShortString;
        }
    }
    
    getCustomerEmployees();

    function init() {
        getOrderLine();
    } 

    function getOrderLine() {
        orderLineService.getById($scope.orderId, $scope.orderLineId).then(function (data) {
            $scope.orderLine = data;
            if($scope.orderLine.orderDate)
                $scope.orderDateAsString = dt($scope.orderLine.orderDate).dateAsShortString;

            $scope.selectedEmployee = $scope.customerEmployees[2];                
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
  
        // 'orderId' and 'orderDate' properties were added before
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
            
        orderLineService.update($scope.orderId, $scope.orderLine)
            .then(function (data) {
                $location.path('/admin/orders/' + $scope.orderId);
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            });
    };
    
    $scope.selectEmployee = function(item, model){
        $scope.orderLine.employeeName = $scope.obj.selectedEmployee.name;
        $scope.orderLine.badgeCode = $scope.obj.selectedEmployee.badgeCode;        
    }
    
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