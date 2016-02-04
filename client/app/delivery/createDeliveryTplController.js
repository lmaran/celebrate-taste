'use strict';

app.controller('createOrderTplController', ['$scope', '$uibModalInstance', 'helperService', 'orderService', 'helperValidator', '$q',
	function ($scope, $uibModalInstance, helperService, orderService, helperValidator, $q) {

    $scope.errors = {};
    $scope.order = {date: new Date()};
    $scope.minDate = new Date();
    //$scope.orderDate = new Date();
    
    // if(dataToModal && dataToModal.length === 10)
    //     $scope.orderDate = helperService.getDateFromString(dataToModal); // "yyyy-mm-dd"
    // else
        
        
    //$scope.orderDate.setDate($scope.orderDate.getDate() + 1); // increment date
    
    $scope.create = function (form) {
        validateFormAsync($scope, form)
            .then(function(){
                if (form.$invalid) return false;
                
                $scope.order.date = helperService.getStringFromDate($scope.order.date); // "yyyy-mm-dd"
                
                orderService.create($scope.order)
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
            });     
    };
    
    
    function validateFormAsync($scope, form){ 
        var deferred = $q.defer();
        var entity = 'order'; 
        helperValidator.setAllFildsAsValid(form);        
        
        // local validations (sync)
        helperValidator.requiredDate($scope, form, entity, 'date');
        
        // return if there are some (local) validation errors
        if (form.$invalid){
            deferred.resolve();
            return deferred.promise;
        }   
             
        // remote validations (async)        
        checkIfOrderExist(form).then(function(){
            deferred.resolve();
        });                
         
        return deferred.promise;
    }          
    
    
    var checkIfOrderExist = function(form){ // return a promise
        var deferred = $q.defer();
        var dateAsString = helperService.getStringFromDate($scope.order.date); // "yyyy-mm-dd"
        orderService.count('date', dateAsString).then(function (count) {
            if(count > 0){
                var errors = [{field:'date', msg:'Exista deja o comanda pentru aceasta data.'}];
                helperValidator.updateValidity($scope, form, errors);
            }
            deferred.resolve();
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
            deferred.reject();
        }); 
        return deferred.promise;
    } 

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    
    
   // ****** calendar settings ****** 
    
    $scope.dateOptions = {
        startingDay: 1,
    };

    $scope.isOpen = false;
    $scope.open = function () {
        $scope.isOpen = true;
    };   
 
    
}]);