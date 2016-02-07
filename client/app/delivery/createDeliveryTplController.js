/* global _ */
'use strict';

app.controller('createDeliveryTplController', ['$scope', '$uibModalInstance', 'helperService', 'deliveryService', 'helperValidator', '$q', 'orderService', 'orderLineService', 'dataToModal',
	function ($scope, $uibModalInstance, helperService, deliveryService, helperValidator, $q, orderService, orderLineService, dataToModal) {

    $scope.errors = {};
    $scope.noOrders = false; 
    $scope.eatSeriesList = [];

    $scope.delivery = {};

    orderService.getAllOpen().then(function (data) {
        $scope.orders = data;
        if($scope.orders.length > 0){         
            $scope.selectedOrder = data[0];
            createEatSeriesList();                      
        } else{
            $scope.noOrders =  true;
        }
    })
    .catch(function (err) {
        alert(JSON.stringify(err, null, 4));
    }); 
    
    
    function createEatSeriesList(){
        $scope.existNewSeries = false; 
        
        orderLineService.getEatSeriesList($scope.selectedOrder._id).then(function (eatSeriesList) {
            $scope.eatSeriesList = _.map(eatSeriesList, function(eatSeries){
                var alreadyExists = _.some(dataToModal, {orderId: $scope.selectedOrder._id, eatSeries: eatSeries}) ? true : false;
                if (!alreadyExists) $scope.existNewSeries = true;
                return { 
                    name:eatSeries, 
                    selected:alreadyExists ? false : true,
                    disabled: alreadyExists
                };
            });
        })         
    } 
    
    $scope.selectOrder = function(){
        createEatSeriesList();
    }
         
    
    $scope.create = function (form) {
        
        if($scope.selectedOrder){
            $scope.delivery.orderId = $scope.selectedOrder._id;
            $scope.delivery.orderDate = $scope.selectedOrder.date;
        }
        
        // in:  [{"name":"Seria 1","selected":true},{"name":"Seria 2","selected":false},{"name":"Seria 3","selected":true}]      
        // out: ['Seria 1', 'Seria 3'];
        $scope.delivery.eatSeriesList = _.chain($scope.eatSeriesList)
            .filter({selected:true})
            .map('name')
            .sortBy()
            .value();

        //validateFormAsync($scope, form)
            //.then(function(){
                //if (form.$invalid) return false;
                //$scope.delivery.date = helperService.getStringFromDate($scope.delivery.date); // "yyyy-mm-dd"
                
                deliveryService.createMany($scope.delivery)
                    .then(function (data) {
                        //$location.path('/admin/badges');
                        $uibModalInstance.close();
                    })
                    .catch(function (err) {
                        // if(err.data.errors){                   
                        //     helperValidator.updateValidity($scope, form, err.data.errors);
                        // } else{
                        //     alert(JSON.stringify(err.data, null, 4)); 
                        // }
                    })                 
            //});     
    };
    
    
    // function validateFormAsync($scope, form){ 
    //     var deferred = $q.defer();
    //     //var entity = 'delivery'; 
    //     helperValidator.setAllFildsAsValid(form);        
    //     
    //     // // local validations (sync)
    //     // helperValidator.requiredDate($scope, form, entity, 'date');
    //     
    //     // // return if there are some (local) validation errors
    //     // if (form.$invalid){
    //     //     deferred.resolve();
    //     //     return deferred.promise;
    //     // }   
    //          
    //     // // remote validations (async)        
    //     // checkIfDeliveryExist(form).then(function(){
    //     //     deferred.resolve();
    //     // });                
    //      
    //     return deferred.promise;
    // }          
    
    
    // var checkIfDeliveryExist = function(form){ // return a promise
    //     var deferred = $q.defer();
    //     var dateAsString = helperService.getStringFromDate($scope.delivery.date); // "yyyy-mm-dd"
    //     deliveryService.count('date', dateAsString).then(function (count) {
    //         if(count > 0){
    //             var errors = [{field:'date', msg:'Exista deja o comanda pentru aceasta data.'}];
    //             helperValidator.updateValidity($scope, form, errors);
    //         }
    //         deferred.resolve();
    //     })
    //     .catch(function (err) {
    //         alert(JSON.stringify(err, null, 4));
    //         deferred.reject();
    //     }); 
    //     return deferred.promise;
    // } 

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }; 
    
}]);