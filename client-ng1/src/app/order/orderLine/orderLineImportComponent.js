(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("orderLineImport",{
        templateUrl:"app/order/orderLine/orderLineImport.html",
        controllerAs:"vm",
        controller:["$route", "$window", "$location", "orderLineService", "helperValidator", "toastr", "helperService", controller]       
    });
       
    function controller($route, $window, $location, orderLineService, helperValidator, toastr, helperService){
        var vm = this;
        var searchObject = $location.search();
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.user = {};
            vm.errors = {}; 
            vm.importData = {};
            vm.eatSeriesList = [
                {name: 'Seria 1'},
                {name: 'Seria 2'},
                {name: 'Seria 3'}
            ];                       
            vm.pageTitle = "Importa comanda";

        };
        
        vm.$routerOnActivate = function (next, previous) {
            vm.orderId = next.params.id;
            if(searchObject.orderDate){
                vm.importData.orderDate = searchObject.orderDate;
                vm.importData.orderId = vm.orderId;
                vm.orderDateAsString = dt(searchObject.orderDate).dateAsShortString;
            }

        };        
        
        
        //
        // public methods
        //
        vm.create = function (form) {     
            validateForm(vm, form);
            if (form.$invalid) return false;

            orderLineService.import(vm.importData)
                .then(function (data) {
                    $location.path('/admin/orders/' + vm.orderId);
                })
                .catch(function (err) {
                    if(err.data.errors){                   
                        helperValidator.updateValidity(vm, form, err.data.errors);
                    } else{
                        alert(JSON.stringify(err.data, null, 4)); 
                    }
                })     
        }
        
        vm.goBack = function(){ 
            $window.history.back();
        }   
        
        
        //
        // private methods
        //        
        function validateForm(vm, form){       
            var entity = 'importData'; 
            helperValidator.setAllFildsAsValid(form);
            
            // fields
            helperValidator.required(vm, form, entity, 'employeesName');
            helperValidator.required50(vm, form, entity, 'eatSeries');         
        }
        
        function dt(dateAsString) { // yyyy-mm-dd
            return helperService.getObjFromString(dateAsString);
        }               

    }
    
})();