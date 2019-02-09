(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("deliveryList",{
        templateUrl:"app/delivery/deliveryList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "deliveryService", "modalService", "toastr", "helperService", "$uibModal", controller]     
    });
       
    function controller($location, $window, deliveryService, modalService, toastr, helperService, $uibModal){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Livrari";
            vm.deliveries = [];
            vm.errors = {};    
            
            getDeliveries();
        };
        
        
        //
        // public methods
        //       
        vm.openCreateDelivery = function () {
            var modalInstance = $uibModal.open({
                animation:false,
                templateUrl: 'app/delivery/createDeliveryTpl.html',
                controller: 'createDeliveryTplController',
                resolve: {
                    dataToModal: function () {
                        return vm.deliveries;
                    }
                }            
            });

            modalInstance.result.then(function () { // "yyyy-mm-dd" 
                vm.refresh();
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });       
        }        

        vm.refresh = function () {
            getDeliveries();
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
        function getDeliveries(){
            deliveryService.getAll().then(function (data) {              
                vm.deliveries = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }        
    }
    
})();