(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    var id;
    
    module.component("user",{
        templateUrl:"app/user/user.html",
        controllerAs:"vm",
        controller:["$route", "$window", "userService", "helperValidator", "toastr", controller]       
    });
       
    function controller($route, $window, userService, helperValidator, toastr){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.user = {};
            vm.errors = {};            
            vm.isFocusOnName = vm.isEditMode ? false : true;    
            vm.isActiveOptions = [{id: true, name: 'Da'},{id: false, name: 'Nu'}];
        };
        
        vm.$routerOnActivate = function (next, previous) {
            id = next.params.id;
            vm.isEditMode = next.routeData.data.action === "edit";
            
            if (vm.isEditMode) {  
                vm.pageTitle = "Editeaza utilizator";
                getUser();                 
            } else {
                vm.pageTitle = "Adauga utilizator"; 
            } 
        };        
        
        
        //
        // public methods
        //
        vm.create = function (form) {
            validateForm(vm, form);
            if (form.$invalid) return false;
            
            userService.create(vm.user)
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
                
            userService.update(vm.user)
                .then(function (data) {
                    // $location.path('/admin/users');
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
            var entity = 'user'; 
            helperValidator.setAllFildsAsValid(form);
            
            // fields
            helperValidator.required50(vm, form, entity, 'name');
            helperValidator.requiredEmail(vm, form, entity, 'email');
        } 
        
        function getUser() {
            //console.log($route.current.params.id);
            userService.getById(id).then(function (data) {
                vm.user = data;
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });
        }               

    }
    
})();