(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("customerEmployeeList",{
        templateUrl:"app/customerEmployee/customerEmployeeList.html",
        controllerAs:"vm",
        controller:['$location', '$window', 'customerEmployeeService', 'modalService', controller]     
    });
       
    function controller($location, $window, customerEmployeeService, modalService){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
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
        
        vm.delete = function (item) {
            var modalOptions = {
                bodyDetails: item.name,           
            };
            modalService.confirm(modalOptions).then(function (result) {
                // get the index for selected item
                for (var i in vm.customerEmployees) {
                    if (vm.customerEmployees[i]._id === item._id) break;
                }

                customerEmployeeService.delete(item._id).then(function () {
                    vm.customerEmployees.splice(i, 1);
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
                if (new RegExp(vm.search, 'i').test(item.name) || new RegExp(vm.search, 'i').test(item.badgeCode)) {
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
            customerEmployeeService.getAll().then(function (data) {
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