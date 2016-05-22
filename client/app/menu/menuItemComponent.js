(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    var menuId, dishId;
    
    module.component("menuItem",{
        templateUrl:"app/menu/menuItem.html",
        controllerAs:"vm",
        controller:["$route", "$window", "menuService", "helperValidator", "helperService", "toastr", controller]       
    });
       
    function controller($route, $window, menuService, helperValidator, helperService, toastr){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.pageTitle = "Editeaza produsul din meniu";
            vm.menu = {};
            vm.dish = {};
            vm.errors = {};            
            vm.isFocusOnName = vm.isEditMode ? false : true;    
            vm.isActiveOptions = [{id: true, name: 'Da'},{id: false, name: 'Nu'}];
        };
        
        vm.$routerOnActivate = function (next, previous) {
            menuId = next.params.menuId;
            dishId = next.params.dishId;
            getMenu();
        };        
        
        
        //
        // public methods
        //
        // vm.create = function (form) {
        //     validateForm(vm, form);
        //     if (form.$invalid) return false;
            
        //     menuService.create(vm.menu)
        //         .then(function (data) {
        //             vm.goBack(); // it comes from rootScope
        //         })
        //         .catch(function (err) {
        //             if(err.data.errors){                   
        //                 helperValidator.updateValidity(vm, form, err.data.errors);
        //             } else{
        //                 alert(JSON.stringify(err.data, null, 4)); 
        //             }
        //         }) 
        // };        
            
        vm.update = function (form) {                    
            validateForm(vm, form);
            if (form.$invalid) return false;
                
            menuService.update(vm.menu)
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
            var entity = 'dish'; 
            helperValidator.setAllFildsAsValid(form);
            
            // fields
            helperValidator.required50(vm, form, entity, 'name');
            helperValidator.required50(vm, form, entity, 'category');
        } 
        
        function getMenu() {
            menuService.getById(menuId).then(function (data) {
                vm.menu = data;
                vm.menuDateAsString = dt(vm.menu.menuDate).dateAsShortString;
                vm.dish = _.find(data.dishes, {_id: dishId});                
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            });
        }
        
        function dt(dateAsString) { // yyyy-mm-dd
            return helperService.getObjFromString(dateAsString);
        }                        

    }
    
})();