(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("deliveryLogList",{
        templateUrl:"app/deliveryLog/deliveryLogList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "deliveryLogService", "modalService", "toastr", "helperService", controller]     
    });
       
    function controller($location, $window, deliveryLogService, modalService, toastr, helperService){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Notificari";
            vm.deliveryLogs = [];
            vm.errors = {};    
            
            getDeliveryLogs();
        };
        
        
        //
        // public methods
        //            
        vm.refresh = function () {
            getDeliveryLogs();
        };

        vm.goBack = function(){ 
            $window.history.back();
        } 
        
        vm.dt = function (dateAsString) { // yyyy-mm-dd
            return helperService.getObjFromString(dateAsString);
        }            
                        
        //
        // private methods
        //
        function getDeliveryLogs(){
            deliveryLogService.getAll().then(function (data) {              
                vm.deliveryLogs = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }        
    }
    
})();