(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("orderLine",{
        templateUrl:"app/order/orderLine/orderLine.html",
        controllerAs:"vm",
        controller:["$route", "$window", "$location", "orderLineService", "helperValidator", "toastr", "$q", "preferenceService", "customerEmployeeService", "helperService", controller]       
    });
       
    function controller($route, $window, $location, orderLineService, helperValidator, toastr, $q, preferenceService, customerEmployeeService, helperService){
        var vm = this;
    
        var promiseToGetCustomerEmployees, promiseToGetOrderLine;
        var userPref = {}; // user preferences
        var searchObject = $location.search();        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.orderLine = {};
            vm.errors = {};            
            vm.isFocusOnName = vm.isEditMode ? false : true;    
            vm.obj = {}; //just a wrapper
            vm.customerEmployees = [];
            vm.eatSeriesList = [
                {name: 'Seria 1'},
                {name: 'Seria 2'},
                {name: 'Seria 3'}
            ];
            getCustomerEmployees(); // should be first
        };
        
        vm.$routerOnActivate = function (next, previous) {
            vm.orderId = next.params.id;
            vm.orderLineId = next.params.id2;
            vm.isEditMode = next.routeData.data.action === "edit";
            
            if (vm.isEditMode) {  
                vm.pageTitle = "Editeaza linia din comanda";
                getOrderLine();   
                // init customer in dropdown; promises should be already declared in this phase
                $q.all([promiseToGetCustomerEmployees, promiseToGetOrderLine])
                    .then(function (result) {
                        vm.obj.selectedEmployee = _.find(vm.customerEmployees, {name : vm.orderLine.employeeName});
                    }, function (reason) {
                        alert('Failed: ' + reason);
                    });                               
            } else {
                vm.pageTitle = "Adauga o line la comanda"; 
                if(searchObject.orderDate){
                    vm.orderLine.orderDate = searchObject.orderDate;
                    vm.orderLine.orderId = vm.orderId;
                    vm.orderDateAsString = dt(searchObject.orderDate).dateAsShortString;
                }
            } 
        };        
        
        
        //
        // public methods
        //
        vm.create = function (form) {        
            validateForm(vm, form);
            if (form.$invalid) return false;
            
            capitalizeOptions(vm.orderLine.option1, vm.orderLine.option2);
            
            // set if preferences come from owner                   
            if(userPref && userPref.option1 && vm.orderLine.option1 && vm.orderLine.option1.toLowerCase() === userPref.option1.toLowerCase())
                vm.orderLine.fromOwnerOpt1 = true;
            if(userPref && userPref.option2 && vm.orderLine.option2 && vm.orderLine.option2.toLowerCase() === userPref.option2.toLowerCase())
                vm.orderLine.fromOwnerOpt2 = true;
    
            // 'orderId' and 'orderDate' properties were added before
            orderLineService.create(vm.orderLine)
                .then(function (data) {
                    $location.path('/admin/orders/' + vm.orderId);
                })
                .catch(function (err) {
                    if(err.data.errors){                   
                        helperValidator.updateValidity(vm, form, err.data.errors);
                    } else{
                        alert(JSON.stringify(err.data, null, 4)); 
                    }
                })     
        }

        vm.update = function (form) {
            validateForm(vm, form);
            if (form.$invalid) return false;
            
            capitalizeOptions(vm.orderLine.option1, vm.orderLine.option2);

            // check (and set accordingly) if preferences come from owner                   
            if(userPref && userPref.option1 && vm.orderLine.option1 && vm.orderLine.option1.toLowerCase() === userPref.option1.toLowerCase())
                vm.orderLine.fromOwnerOpt1 = true;
            else
                delete vm.orderLine.fromOwnerOpt1;
            
            if(userPref && userPref.option2 && vm.orderLine.option2 && vm.orderLine.option2.toLowerCase() === userPref.option2.toLowerCase())
                vm.orderLine.fromOwnerOpt2 = true; 
            else
                delete vm.orderLine.fromOwnerOpt2;                   
                
            orderLineService.update(vm.orderLine)
                .then(function (data) {
                    $location.path('/admin/orders/' + vm.orderId);
                })
                .catch(function (err) {
                    if(err.data.errors){                   
                        helperValidator.updateValidity(vm, form, err.data.errors);
                    } else{
                        alert(JSON.stringify(err.data, null, 4)); 
                    }
                });
        };
        
        vm.selectEmployee = function(item, model){
            vm.orderLine.employeeName = vm.obj.selectedEmployee.name;
            vm.orderLine.badgeCode = vm.obj.selectedEmployee.badgeCode; 
            preferenceService.getByEmployeeAndDate(vm.orderLine.employeeName, vm.orderLine.orderDate)
                .then(function(preferences){
                    if(preferences.length === 1){                    
                        vm.orderLine.option1 = preferences[0].option1;
                        vm.orderLine.option2 = preferences[0].option2;
                        userPref = preferences[0]; // preserve user preferences for later use
                    } else{
                        vm.orderLine.option1 = undefined;
                        vm.orderLine.option2 = undefined;                    
                    }
                })
                .catch(function (err) {
                    alert(JSON.stringify(err, null, 4));
                })                  
        }        
        
        vm.goBack = function(){ 
            $window.history.back();
        }   
        
        
        //
        // private methods
        //        
        function getOrderLine() {
            promiseToGetOrderLine = orderLineService.getById(vm.orderLineId).then(function (data) {
                vm.orderLine = data;
                if(data.orderDate){
                    vm.orderDateAsString = dt(data.orderDate).dateAsShortString;
                } 
                
                // update user preferences
                preferenceService.getByEmployeeAndDate(data.employeeName, data.orderDate)
                    .then(function(preferences){
                        if(preferences.length === 1){
                            vm.orderLine.option1 = preferences[0].option1;
                            vm.orderLine.option2 = preferences[0].option2;                                           
                            userPref = preferences[0]; // preserve for later use
                        }
                    })
                
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            })
        }  
        
        function getCustomerEmployees(){
            promiseToGetCustomerEmployees = customerEmployeeService.getAll().then(function (data) {
                vm.customerEmployees = data;             
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });
        }  
            
        function validateForm(vm, form){       
            var entity = 'orderLine'; 
            helperValidator.setAllFildsAsValid(form);
            
            // fields
            helperValidator.required50(vm, form, entity, 'employeeName');
            helperValidator.required50(vm, form, entity, 'eatSeries');         
        }
        
        function dt(dateAsString) { // yyyy-mm-dd
            return helperService.getObjFromString(dateAsString);
        }
        
        function capitalizeOptions(option1, option2){
            if(vm.orderLine.option1) 
                vm.orderLine.option1 = vm.orderLine.option1.toUpperCase();
            if(vm.orderLine.option2) 
                vm.orderLine.option2 = vm.orderLine.option2.toUpperCase();
        }                        

    }
    
})();