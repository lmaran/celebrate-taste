(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    var id;
    
    module.component("customerEmployee",{
        templateUrl:"app/customerEmployee/customerEmployee.html",
        controllerAs:"vm",
        controller:["$route", "$window", "customerEmployeeService", "helperValidator", controller]       
    });
       
    function controller($route, $window, customerEmployeeService, helperValidator){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.customerEmployee = {};
            vm.errors = {};            
            vm.isFocusOnName = vm.isEditMode ? false : true;    
            vm.isActiveOptions = [{id: true, name: 'Da'},{id: false, name: 'Nu'}];
        };
        
        vm.$routerOnActivate = function (next, previous) {
            id = next.params.id;
            vm.isEditMode = next.routeData.data.action === 'edit';
            
            if (vm.isEditMode) {  
                vm.pageTitle = "Editeaza angajat";
                getCustomerEmployee();                 
            } else {
                vm.pageTitle = "Adauga angajat"; 
            } 
        };        
        
        
        //
        // public methods
        //
        vm.create = function (form) {
            validateForm(vm, form);
            if (form.$invalid) return false;
            
            customerEmployeeService.create(vm.customerEmployee)
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
            if(vm.customerEmployee.askForNotification && !vm.customerEmployee.email){
                alert('Ai ales sa notifici clientul dar lipseste adresa de email!');
                return false;
            }
            
            validateForm(vm, form);
            if (form.$invalid) return false;
                
            customerEmployeeService.update(vm.customerEmployee)
                .then(function (data) {
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
            var entity = 'customerEmployee'; 
            helperValidator.setAllFildsAsValid(form);
            
            // fields
            helperValidator.required50(vm, form, entity, 'name');
            helperValidator.optionalEmail(vm, form, entity, 'email');
        } 
        
        function getCustomerEmployee() {
            customerEmployeeService.getById(id).then(function (data) {
                vm.customerEmployee = data;
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });
        }               

    }
    
})();