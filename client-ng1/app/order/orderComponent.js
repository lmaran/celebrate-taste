(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("order",{
        templateUrl:"app/order/order.html",
        controllerAs:"vm",
        controller:["$route", "$window", "orderService", "helperValidator", "toastr", "helperService", controller]       
    });
       
    function controller($route, $window, orderService, helperValidator, toastr, helperService){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
        };
        
        vm.$routerOnActivate = function (next, previous) {
            vm.orderId = next.params.id;
            getOrder();
        };        
        
        
        //
        // public methods
        //       
        vm.goBack = function(){ 
            $window.history.back();
        }   
        
        
        //
        // private methods
        //                
        function getOrder() {
            orderService.getById(vm.orderId).then(function (data) {
                vm.order = data;
                vm.dateAsShortString = dt(vm.order.date).dateAsShortString;
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });
        }  
        
        function dt(dateAsString) { // yyyy-mm-dd
            return helperService.getObjFromString(dateAsString);
        }                       

    }
    
})();