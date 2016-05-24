(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    var id;
    
    module.component("order",{
        templateUrl:"app/order/order.html",
        controllerAs:"vm",
        controller:["$route", "$window", "orderService", "helperValidator", "toastr", controller]       
    });
       
    function controller($route, $window, orderService, helperValidator, toastr){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.order = {};
            vm.errors = {};            
            vm.pageTitle = "Comanda:xxx"; 
        };
        
        vm.$routerOnActivate = function (next, previous) {
            id = next.params.id;
            //getOrder();
        };        
        
        
        //
        // public methods
        //
        vm.create = function (form) {
            validateForm(vm, form);
            if (form.$invalid) return false;
            
            orderService.create(vm.order)
                .then(function (data) {
                    vm.goBack(); // it comes from rootScope
                })
                .catch(function (err) {
                    if(err.data.errors){                   
                        helperValidator.updateValidity(vm, form, err.data.errors);
                    } else{
                        alert(JSON.stringify(err.data, null, 4)); 
                    }
                }) 
        };        
            
        vm.update = function (form) {                    
            validateForm(vm, form);
            if (form.$invalid) return false;
                
            orderService.update(vm.order)
                .then(function (data) {
                    // $location.path('/admin/orders');
                    vm.goBack(); // it comes from rootScope
                })
                .catch(function (err) {
                    if(err.data.errors){                   
                        helperValidator.updateValidity(vm, form, err.data.errors);
                    } else{
                        alert(JSON.stringify(err.data, null, 4)); 
                    }
                });
        };
        
        vm.goBack = function(){ 
            $window.history.back();
        }   
        
        
        //
        // private methods
        //        
        function validateForm(vm, form){ 
            var entity = 'order'; 
            helperValidator.setAllFildsAsValid(form);
            
            // fields
            helperValidator.required50(vm, form, entity, 'name');
            helperValidator.requiredEmail(vm, form, entity, 'email');
        } 
        
        // function getOrder() {
        //     orderService.getById(id).then(function (data) {
        //         vm.order = data;
        //     })
        //     .catch(function (err) {
        //         alert(JSON.stringify(err, null, 4));
        //     });
        // }               

    }
    
})();