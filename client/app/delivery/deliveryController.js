/*global app*/
'use strict';

app.controller('deliveryController', ['$scope', '$route', 'deliveryService', '$location', 'helperValidator', 'helperService', 'orderLineService',
    function ($scope, $route, deliveryService, $location, helperValidator, helperService, orderLineService) {
        
    //$scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.delivery = {};
   
    //if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    //}

    function init() {
        getDelivery();
    } 
    
    $scope.refresh = function () {
        init();
    };    

    function getDelivery() {
        deliveryService.getById($route.current.params.id).then(function (data) {
            $scope.delivery = data;
            $scope.dateAsShortString = dt($scope.delivery.orderDate).dateAsShortString;
            getEatSeriesDetails(data.orderId, data.eatSeries);
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        })
    } 
    
    function getEatSeriesDetails(orderId, eatSeries){
        orderLineService.getEatSeriesDetails(orderId, eatSeries).then(function (data) {
            $scope.orderLines = data;                                          
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });        
    } 

    
    function dt(dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    }          

}])