(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("partnerOrderList",{
        templateUrl:"app/partnerOrder/partnerOrderList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "partnerOrderService", "modalService", "toastr", "helperService", "$uibModal", controller]     
    });
       
    function controller($location, $window, partnerOrderService, modalService, toastr, helperService, $uibModal){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Comenzi";
            vm.partnerOrders = [];
            vm.errors = {};    
            
            getPartnerOrders();
        };
        
        
        //
        // public methods
        //
        vm.showEmployees = function(employees, msg){
            var modalSettings = {
                animation: false,
                templateUrl: 'app/common/templates/showEmployees.html'
            };
            
            var modalOptions = {
                closeButtonText: 'Renunta',
                headerText: msg,
                employees: employees       
            };
                    
            modalService.show(modalSettings, modalOptions);
        
        }                  
                        
        vm.refresh = function () {
            getPartnerOrders();
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
        function getPartnerOrders(){
            partnerOrderService.getAll().then(function (data) {              
                vm.partnerOrders = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }        
    }
    
})();