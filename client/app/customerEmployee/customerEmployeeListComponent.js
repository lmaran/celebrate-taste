(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("customerEmployeeList",{
        templateUrl:"app/customerEmployee/customerEmployeeList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "customerEmployeeService", "modalService", controller]     
    });
       
    function controller($location, $window, customerEmployeeService, modalService){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Angajati client";
            vm.customerEmployees = [];
            vm.errors = {};    
            
            getCustomerEmpoyees();
        };
        
        
        //
        // public methods
        //       
        vm.create = function () {
            $location.path('/admin/customerEmployees/create');
        }
        
        vm.delete = function (customerEmployee) {
            var modalOptions = {
                bodyDetails: customerEmployee.name,           
            };
            modalService.confirm(modalOptions).then(function (result) {
                customerEmployeeService.delete(customerEmployee._id).then(function () {
                     _.remove(vm.customerEmployees, {_id: customerEmployee._id});
                })
                .catch(function (err) {
                    vm.errors = JSON.stringify(err.data, null, 4);
                    alert(vm.errors);
                });
            });
        };

        vm.filterBySearch = function (item) {
            var isMatch = false;
            if (vm.search) {
                // search by employeeName or badge
                if (new RegExp(vm.search, 'i').test(item.name) || new RegExp(vm.search, 'i').test(item.badgeCode) || new RegExp(vm.search, 'i').test(item.adjustedName)) {
                    isMatch = true;
                }
            } else {
                // if nothing is entered, return all posts
                isMatch = true;
            }
            return isMatch;
        };          

        vm.refresh = function () {
            getCustomerEmpoyees();
        };

        vm.goBack = function(){ 
            $window.history.back();
        } 
        
                        
        //
        // private methods
        //
        function getCustomerEmpoyees(){
            customerEmployeeService.getAllWithBadgeInfo().then(function (data) {
                vm.customerEmployees = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }        
    }
    
})();