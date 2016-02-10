/*global app*/
/* global _ */
'use strict';

app.controller('deliveryController', ['$scope', '$route', 'deliveryService', '$location', 'helperValidator', 'helperService', 'orderLineService', '$uibModal', '$timeout', 'menuService', 'toastr',
    function ($scope, $route, deliveryService, $location, helperValidator, helperService, orderLineService, $uibModal, $timeout, menuService, toastr) {
        
    //$scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.delivery = {};
    $scope.preferences=['A', 'B', 'C', 'D'];
    $scope.selectedPreference = 'Toate pref.';
    
    $scope.obj={};
    $scope.obj.isFocusOnBadge = true;
   
    init();     

    function init() {
        getDelivery();
    } 
    
    $scope.refresh = function () {
        init();
    }; 
    
    $scope.obj.onlyNoBadges = false;    

    function getDelivery() {
        deliveryService.getById($route.current.params.id).then(function (data) {
            $scope.delivery = data;
            $scope.dateAsShortString = dt($scope.delivery.orderDate).dateAsShortString;
            getMenus($scope.delivery.orderDate);
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        })
    } 
    
    function getMenus(orderDate){
        menuService.getMenu(orderDate).then(function (data) {
            $scope.menu = data[0];         
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
        var templateUrl = 'app/delivery/openToCompleteTpl.html';
        if(orderLine.status === 'completed'){
            templateUrl = 'app/delivery/openToRevokeTpl.html';
        }         
        
        setDishOptions(orderLine);
           
        var modalInstance = $uibModal.open({
            animation:false,
            templateUrl: templateUrl,
            controller: 'openDeliveryLineTplController',
            resolve: {
                dataToModal: function () {
                    return {
                        orderLine: orderLine,
                        option1: $scope.option1,
                        option2: $scope.option2
                    }
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
        $scope.orderLine = undefined; // clean up the screen
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
                
                if($scope.orderLine.status !== 'completed'){
                    // set orderLine as 'completed'
                    var orderLineClone = {};
                    angular.copy($scope.orderLine, orderLineClone); // deep copy (to deal with status and 'strike-through')
        
                    orderLineClone.status = 'completed';
                    orderLineClone.deliveryDate = new Date();                                            
                    orderLineService.update(orderLineClone)
                        .then(function (data) {
                            toastr.success('Livrarea a fost inregistrata!');
                        })
                        .catch(function (err) {
                            alert(JSON.stringify(err.data, null, 4)); 
                        })                    
                }
                
                setDishOptions($scope.orderLine);
            }
            $scope.obj.badgeCode = ''; // reset badgeCode in UI
            $scope.obj.isFocusOnBadge = true;                                   
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });                 
    }
    
    // return an orderLine back to open status
    $scope.revoke = function (orderLine) { 
        orderLine.status = 'open';
        delete orderLine.deliveryDate;
                
        orderLineService.update(orderLine)
            .then(function (data) {
                toastr.success('Livrarea a fost anulata!');
                $scope.orderLine = undefined; // clean up the screen
                $scope.obj.isFocusOnBadge = true;
            })
            .catch(function (err) {
                alert(JSON.stringify(err.data, null, 4)); 
            })                    
    };     
    
    function setDishOptions(orderLine){
        $scope.option1 = _.find($scope.menu.dishes, {option: orderLine.option1});
        $scope.option2 = _.find($scope.menu.dishes, {option: orderLine.option2});
    } 
    
    $scope.badgesFilter = function(orderLine){
        if($scope.obj.onlyNoBadges){
            return !orderLine.badgeCode;
        } else return true;
    }
    
    $scope.selectPreference = function(preference){
        if(preference === 'Toate pref.'){
            $scope.selectedPreference = 'Toate pref.';
        } else {
            $scope.selectedPreference = preference;
        }
    }    
    
    $scope.preferencesFilter = function(orderLine){
        if($scope.selectedPreference === 'Toate pref.'){
            return true;
        } else if ($scope.selectedPreference === 'A' || $scope.selectedPreference === 'B'){
            return orderLine.option1 === $scope.selectedPreference;
        } else if ($scope.selectedPreference === 'C' || $scope.selectedPreference === 'D'){
            return orderLine.option2 === $scope.selectedPreference;
        } else if($scope.selectedPreference === 'Fara pref.'){
            return !(orderLine.option1 && orderLine.option2);
        }
    }                

}])