/*global app*/
/* global _ */
'use strict';

app.controller('deliveryController', ['$scope', '$route', 'deliveryService', '$location', 'helperValidator', 'helperService', 'orderLineService', '$uibModal', '$timeout', 'menuService', 'toastr',
    function ($scope, $route, deliveryService, $location, helperValidator, helperService, orderLineService, $uibModal, $timeout, menuService, toastr) {
        
    //$scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.delivery = {};
    
    
    $scope.obj={};
    $scope.obj.isFocusOnBadge = true;
   
    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
    init();     

    function init() {
        getDelivery();
        
        // var searchObject = $location.search();
        // if(searchObject.onlyNoBadges)
        //     $scope.obj.onlyNoBadges = true;  
        // else
        //     $scope.obj.onlyNoBadges = false;        
    } 
    
    $scope.refresh = function () {
        init();
    }; 
    
    $scope.obj.onlyNoBadges = false;    

    function getDelivery() {
        deliveryService.getById($route.current.params.id).then(function (data) {
            $scope.delivery = data;
            $scope.dateAsShortString = dt($scope.delivery.orderDate).dateAsShortString;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        })
    } 
    
    function getEatSeriesDetails(orderId, eatSeries, sortByDeliveryDate){
        orderLineService.getEatSeriesDetails(orderId, eatSeries).then(function (data) {
            if(sortByDeliveryDate){
                $scope.orderLines = _.orderBy(data, 'deliveryDate', 'desc');   
            } else { 
                $scope.orderLines = data;
            }                                      
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });        
    } 
   
    $scope.openDeliveryLine = function(orderLine){
        var modalInstance = $uibModal.open({
            animation:false,
            templateUrl: 'app/delivery/openDeliveryLineTpl.html',
            controller: 'openDeliveryLineTplController',
            resolve: {
                dataToModal: function () {
                    return orderLine;
                }
            }            
        });

        modalInstance.result.then(function () { // "yyyy-mm-dd" 
            $scope.refresh();
        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });          
    }

    
    function dt(dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    } 
    
    $scope.statusFilter = function(orderLine){
        return orderLine.status === $scope.selectedStatus;
    }
    
    $scope.selectTab23 = function(status){
        $scope.selectedStatus = status;
        var sortByDeliveryDate = (status ==='completed')? true : false;
        getEatSeriesDetails($scope.delivery.orderId, $scope.delivery.eatSeries, sortByDeliveryDate);
    }
    
    $scope.selectTab1 = function(){       
        $scope.obj.isFocusOnBadge = true;
        $scope.orderLine = undefined;
    }
    
    $scope.deliverByBadge = function(form){
        orderLineService.getOrderLinesByBadge($scope.delivery.orderId, $scope.delivery.eatSeries, $scope.obj.badgeCode).then(function (data) {
            if(data.length === 0){
                $scope.errorValidation = true;
                $scope.errorMessage = "Card negasit: " + $scope.obj.badgeCode;
            } else if(data.length > 1) {
                $scope.errorValidation = true;
                $scope.errorMessage = "Exista mai multe persoane cu acelasi card: " + $scope.obj.badgeCode;             
            } else {
                $scope.errorValidation = false;
                $scope.orderLine = data[0];
                
                toastr.success('Livrarea a fost inregistrata cu succes!');
                
                if($scope.menu){
                    setDishOptions();
                } else{
                    menuService.getMenu($scope.orderLine.orderDate).then(function (data) {
                        $scope.menu = data[0]; // cache menu items
                        setDishOptions();
                    })                    
                }
            }
            $scope.obj.badgeCode = ''; // reset badgeCode in UI                                     
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });                 
    }
    
    function setDishOptions(){
        $scope.option1 = _.find($scope.menu.dishes, {option: $scope.orderLine.option1});
        $scope.option2 = _.find($scope.menu.dishes, {option: $scope.orderLine.option2});
    } 
    
    $scope.badgesFilter = function(orderLine){
        if($scope.obj.onlyNoBadges){
            return !orderLine.badgeCode;
        } else return true;
    }              

}])