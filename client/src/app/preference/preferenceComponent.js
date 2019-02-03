(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    var id;
    
    module.component("preference",{
        templateUrl:"app/preference/preference.html",
        controllerAs:"vm",
        controller:["$route", "$window", "preferenceService", "helperValidator", "toastr", controller]       
    });
       
    function controller($route, $window, preferenceService, helperValidator, toastr){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.preference = {};
            vm.errors = {};              
            vm.pageTitle = "Editeaza preferinte";
        };
        
        vm.$routerOnActivate = function (next, previous) {
            id = next.params.id;
            getPreference(); 
        };        
        
        
        //
        // public methods
        //            
        vm.update = function (form) {                    
            preferenceService.update(vm.preference)
                .then(function (data) {
                    // $location.path('/admin/preferences');
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
        function getPreference() {
            preferenceService.getById(id).then(function (data) {
                vm.preference = data;
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });
        }               

    }
    
})();