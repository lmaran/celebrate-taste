/*global app*/
'use strict';

app.controller('orderLineImportController', ['$scope', '$route', 'orderLineService', '$location', 'helperValidator', 'helperService',
    function ($scope, $route, orderLineService, $location, helperValidator, helperService) {

    $scope.orderId = $route.current.params.id; 
    $scope.orderLineId = $route.current.params.id2; 

    var searchObject = $location.search();
          
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.orderLine = {};
    $scope.importData = {};

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
            $scope.importData.orderDate = searchObject.orderDate;
            $scope.importData.orderId = $scope.orderId;
            $scope.orderDateAsString = dt(searchObject.orderDate).dateAsShortString;
        }
    }

    function init() {
        getOrderLine();
    } 

    function getOrderLine() {
        orderLineService.getById($scope.orderId, $scope.orderLineId).then(function (data) {
            $scope.orderLine = data;
            if($scope.orderLine.orderDate)
                $scope.orderDateAsString = dt($scope.orderLine.orderDate).dateAsShortString;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        })
    }     

    $scope.create = function (form) {     
        validateForm($scope, form);
        if (form.$invalid) return false;
        
        // var customerEmployees = $scope.importData.employeesName.split('\n');
        // console.log(customerEmployees);
        
        // 'orderId' and 'orderDate' properties were added before
        orderLineService.import($scope.orderId, $scope.importData)
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
    
    function validateForm($scope, form){       
        var entity = 'importData'; 
        helperValidator.setAllFildsAsValid(form);
        
        // fields
        helperValidator.required($scope, form, entity, 'employeesName');
        helperValidator.required50($scope, form, entity, 'eatSeries');         
    }
    
    function dt(dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    }            

}])