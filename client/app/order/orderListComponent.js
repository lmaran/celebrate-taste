(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("orderList",{
        templateUrl:"app/order/orderList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "orderService", "modalService", "toastr", "helperService", "$uibModal", controller]     
    });
       
    function controller($location, $window, orderService, modalService, toastr, helperService, $uibModal){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Comenzi";
            vm.orders = [];
            vm.errors = {};    
            
            getOrders();
        };
        
        
        //
        // public methods
        //               
        vm.openCreateOrder = function () {
            var modalInstance = $uibModal.open({
                animation:false,
                templateUrl: 'app/order/createOrderTpl.html',
                controller: 'createOrderTplController'
            });

            modalInstance.result.then(function () { // "yyyy-mm-dd" 
                vm.refresh();
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });       
        }         
        
        vm.delete = function (order) {
            var modalOptions = {
                bodyDetails: order.name,           
            };
            modalService.confirm(modalOptions).then(function (result) {
                orderService.delete(order._id).then(function () {
                    _.remove(vm.orders, {_id: order._id});                  
                })
                .catch(function (err) {
                    vm.errors = JSON.stringify(err.data, null, 4);
                    alert(vm.errors);
                });
            });
        }         

        vm.refresh = function () {
            getOrders();
        }

        vm.goBack = function(){ 
            $window.history.back();
        } 
        
        vm.dt = function (dateAsString) { // yyyy-mm-dd
            return helperService.getObjFromString(dateAsString);
        }        
        
        vm.closeOrder = function(orderId){
            
            var modalOptions = {
                actionButtonText: 'Finalizeaza',
                headerText: 'Finalizare/Arhivare comanda',
                bodyTitle: 'Esti sigur ca vrei sa finalizezi aceasta comanda?',
                bodyDetails: 'Odata finalizata, comanda nu mai poate fi redeschisa!'         
            };
            
            modalService.confirm(modalOptions).then(function (result) {            
                orderService.closeOrder(orderId).then(function(data){
                    var currentOrder = _.find(vm.orders, {_id: orderId});
                    currentOrder.summary = data;
                    currentOrder.status = 'completed';
                })
                .catch(function (err) {
                    if(err.status !== 401) {
                        alert(JSON.stringify(err, null, 4));
                    }
                }); 
            });        
        }
        
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
                        
        //
        // private methods
        //
        function getOrders(){
            orderService.getAll().then(function (data) {              
                vm.orders = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }        
    }
    
})();