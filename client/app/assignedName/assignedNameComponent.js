/* global _ */
(function() {    
    "use strict";
    
    var module = angular.module("celebrate-taste");
    var id;
    
    module.component("assignedName",{
        templateUrl:"app/assignedName/assignedName.html",
        controllerAs:"vm",
        controller:["$route", "$window", "assignedNameService", "helperValidator", controller]       
    });
       
    function controller($route, $window, assignedNameService, helperValidator){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.assignedName = {};
            vm.errors = {};            
            vm.isFocusOnName = vm.isEditMode ? false : true;    
            vm.isActiveOptions = [{id: true, name: 'Da'},{id: false, name: 'Nu'}];
            vm.badges=[
                {code:"0009877", ownerCode:"AMolnar AAaaa"},
                {code:"000987", ownerCode:"Molnar Aaaa"}
            ];
            vm.employees=[
                {_id:"112233445", name:"BMolnar Aaaa123"},
                {_id:"11223344", name:"Molnar Aaaa123"}
            ];            
        };
        
        vm.$routerOnActivate = function (next, previous) {
            id = next.params.id;
            vm.isEditMode = next.routeData.data.action === 'edit';
            
            if (vm.isEditMode) {  
                vm.pageTitle = "Editeaza asociere";
                getAssignedName();                 
            } else {
                vm.pageTitle = "Adauga asociere"; 
            } 
        };        
        
        
        //
        // public methods
        //
        vm.create = function (form) {
            // console.log(vm.assignedName);
            validateForm(vm, form);
            if (form.$invalid) return false;

            var employee = _.find(vm.employees, {_id: vm.assignedName.employeeId});
            vm.assignedName.employeeName = employee.name;

            assignedNameService.create(vm.assignedName)
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
            if(vm.assignedName.askForNotification && !vm.assignedName.email){
                alert('Ai ales sa notifici clientul dar lipseste adresa de email!');
                return false;
            }
            
            validateForm(vm, form);
            if (form.$invalid) return false;
                
            var employee = _.find(vm.employees, {_id: vm.assignedName.employeeId});
            vm.assignedName.employeeName = employee.name;

            assignedNameService.update(vm.assignedName)
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
            var entity = 'assignedName'; 
            helperValidator.setAllFildsAsValid(form);
            
            // fields
            helperValidator.required50(vm, form, entity, 'badgeOwnerCode');
            helperValidator.required50(vm, form, entity, 'employeeId');
        } 
        
        function getAssignedName() {
            assignedNameService.getById(id).then(function (data) {
                vm.assignedName = data;
                // console.log(vm.assignedName);
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });
        }               

    }
    
})();