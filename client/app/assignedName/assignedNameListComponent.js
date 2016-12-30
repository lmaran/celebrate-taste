(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("assignedNameList",{
        templateUrl:"app/assignedName/assignedNameList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "assignedNameService", "modalService", controller]     
    });
       
    function controller($location, $window, assignedNameService, modalService){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Asocieri de nume";
            vm.assignedNames = [];
            vm.errors = {};    
            
            getCustomerEmpoyees();
        };
        
        
        //
        // public methods
        //       
        vm.create = function () {
            $location.path('/admin/assignedNames/create');
        }
        
        vm.delete = function (assignedName) {
            var modalOptions = {
                bodyDetails: assignedName.name,           
            };
            modalService.confirm(modalOptions).then(function (result) {
                assignedNameService.delete(assignedName._id).then(function () {
                     _.remove(vm.assignedNames, {_id: assignedName._id});
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
            assignedNameService.getAll().then(function (data) {
                vm.assignedNames = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }        
    }
    
})();