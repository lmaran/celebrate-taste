/*global app*/
/* global _ */
'use strict';

app.controller('deliveryController', ['$scope', '$route', 'deliveryService', '$location', 'helperValidator', 'helperService', 'orderLineService', '$uibModal', '$timeout', 'menuService', 'toastr', 'customerEmployeeService', 'orderService',
    function ($scope, $route, deliveryService, $location, helperValidator, helperService, orderLineService, $uibModal, $timeout, menuService, toastr, customerEmployeeService, orderService) {
        
    //$scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.delivery = {};
    $scope.preferences=['A', 'B', 'C', 'D'];
    $scope.selectedPreference = 'Toate pref.';
    
    $scope.deliverySummary = {};

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
            getDeliverySummary(data.orderId, data.eatSeries);
        })
        .catch(function (err) {
            if(err.status !== 401) {
                alert(JSON.stringify(err, null, 4));
            }
        })
    } 
    
    function getDeliverySummary(orderId, eatSeries){
        orderService.getDeliverySummary(orderId, eatSeries).then(function (data) {
            $scope.deliverySummary = data;         
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
   
    $scope.openDeliveryLine = function(orderLine, status){
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
            //$scope.refresh();
            if(status === 'open') $scope.refreshOpen();
            else $scope.refreshCompleted();
        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });          
    }

    
    function dt(dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    } 
    
    var getOrderLinesOpen = function(){
        orderLineService.getOrderLinesBySeriesAndStatus($scope.delivery.orderId, $scope.delivery.eatSeries, 'open').then(function (data) {
            $scope.orderLinesOpen = data;                                     
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });         
    }      
    
    // handle 'open' lines 
    $scope.refreshOpen = function(){
        getOrderLinesOpen();      
    }      
    
    $scope.selectTabOpen = function(){
        getOrderLinesOpen();         
    }
    
    
    var getOrderLinesCompleted = function(){
        orderLineService.getOrderLinesBySeriesAndStatus($scope.delivery.orderId, $scope.delivery.eatSeries, 'completed').then(function (data) {
            $scope.orderLinesCompleted = _.orderBy(data, 'deliveryDate', 'desc');                                   
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });        
    }      
    
    // handle 'completed' lines
    $scope.refreshCompleted = function(){
        getOrderLinesCompleted();      
    }      
    
    $scope.selectTabCompleted = function(status){
        getOrderLinesCompleted();
    }    
        
    $scope.selectTab1 = function(){       
        $scope.obj.isFocusOnBadge = true;
        $scope.orderLine = undefined;
        getDeliverySummary($scope.delivery.orderId, $scope.delivery.eatSeries)
    }
    
    $scope.deliverByBadge = function(form){
        $scope.orderLine = undefined; // clean up the screen
        if($scope.obj.badgeCode.length !== 10 || isNaN($scope.obj.badgeCode)){
            $scope.errorValidation = true;
            $scope.errorMessage = "'" +$scope.obj.badgeCode +  "' este un cod invalid! (nu are 10 cifre)";
            $scope.obj.badgeCode = ''; // reset badgeCode in UI
            $scope.obj.isFocusOnBadge = true; 
            return;
        }
        
        var newBadgeCode = getNewBadge($scope.obj.badgeCode); // '0007453659' --> '0011348091'
        
        orderLineService.getOrderLinesByBadge($scope.delivery.orderId, newBadgeCode).then(function (data) {
            if(data.length === 0){
                var bCode = $scope.obj.badgeCode;
                customerEmployeeService.getByBadge(newBadgeCode).then(function (data) {
                    
                    if(data.length > 0){
                        $scope.errorMessage = "Lipsa comanda pt. " + bCode + " (" + newBadgeCode + ") - " + data[0].name;
                    } else {
                        $scope.errorMessage = "Card negasit: " + bCode + " (" + newBadgeCode + ")";
                    }
                    
                    $scope.errorValidation = true;
                    
                    // collect log info
                    var log = {
                        orderDate: $scope.delivery.orderDate,
                        series: $scope.delivery.eatSeries,
                        msg: $scope.errorMessage
                    }
                    
                    deliveryService.createLog(log)
                        .then(function (data) {
                            toastr.success('Datele despre acest card au fost memorate pt. investigatii ulterioare.');
                        })
                        .catch(function (err) {
                            alert(JSON.stringify(err.data, null, 4)); 
                        })                     
                    
                })
                .catch(function (err) {
                    alert(JSON.stringify(err, null, 4));
                })                
                
            } else if(data.length > 1) {
                $scope.errorValidation = true;
                $scope.errorMessage = "Exista mai multe persoane cu acelasi card: " + $scope.obj.badgeCode + " (" + newBadgeCode + ")";            
            } else if(data[0].eatSeries !== $scope.delivery.eatSeries) {
                $scope.errorValidation = true;
                if(data[0].status === 'completed')
                    $scope.errorMessage = "Posesorul acestui card a mancat in " + data[0].eatSeries + "."; 
                else
                    $scope.errorMessage = "Posesorul acestui card a fost programat in " + data[0].eatSeries + ".";             
            } else {
                $scope.errorValidation = false;
                $scope.orderLine = data[0];
                
                if($scope.orderLine.status !== 'completed'){
                    // set orderLine as 'completed' and save
                    var orderLineClone = {};
                    angular.copy($scope.orderLine, orderLineClone); // deep copy (to deal with status and 'strike-through')
        
                    orderLineClone.status = 'completed';
                    orderLineClone.deliveryDate = new Date();    
                    orderLineClone.deliveryMode = "card";
                                                                     
                    orderLineService.update(orderLineClone)
                        .then(function (data) {
                            $scope.deliverySummary = data.data;
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
                $scope.deliverySummary = data.data;
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

    function getNewBadge(inputCode){ // '0007453659'; (first code printed on card)
        var intCode =parseInt(inputCode, 10); // 7453659 (int)
        var hexaCode =intCode.toString(16); // 71BBDB (hex)

        var startHex = hexaCode.substr(0, hexaCode.length - 4); // 71 (hex)    
        var endHex = hexaCode.substr(hexaCode.length - 4); // BBDB (hex)

        if(startHex.length > 2){
            startHex = startHex.substr(startHex.length - 2); // in first group, keep only last 2 chars
        }
        
        var startInt = parseInt(startHex, 16) // 113 (int)
        var endInt = parseInt(endHex, 16) // 48091 (int)
        
        // pad each part with zero 
        var startPadded = padDigits(startInt, 5) // '00113' (str)
        var endPadded = padDigits(endInt, 5) // '48091' (str)        

        //var aggInt = startInt.toString() + endInt.toString(); // '11348091'
        
        //var rez = padDigits(aggInt, 10); // '0011348091' (last code printed on card)
        return startPadded + endPadded;        
    } 
    
    //http://stackoverflow.com/a/10075654
    // padDigits(23, 4); --> "0023"
    function padDigits(number, digits) {
        return Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
    }                 

}])