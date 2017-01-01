(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("orderLineList",{
        bindings:{
            orderId:"<",
            orderDate:"<"
        },
        templateUrl:"app/order/orderLine/orderLineList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "orderLineService", "modalService", "toastr", controller]     
    });
       
    function controller($location, $window, orderLineService, modalService, toastr){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Utilizatori";
            vm.orderLines = [];
            vm.errors = {};  
            vm.preferences=['A', 'B', 'C', 'D'];  
            vm.obj = {};
            vm.obj.onlyNoBadges = false; 
            //console.log(vm.orderId);   
            getOrderLines();          
        };
        
        // vm.$routerOnActivate = function (next, previous) {
        //     console.log("aaa" + next.params.id);
        //     vm.orderId = next.params.id;
        //     //getOrderLines();
        // };          
        
        //
        // public methods
        //       
        vm.create = function () {
            $location.path('/admin/orders/' + vm.orderId + '/orderLines/create');
            $location.search('orderDate', vm.orderDate); // add property to url
        }
        
        vm.import = function () {
            $location.path('/admin/orders/' + vm.orderId + '/orderLines/import');
            $location.search('orderDate', vm.orderDate); // add property to url
        } 
                
        vm.delete = function (orderLine) {
            var modalOptions = {
                bodyDetails: 'Comanda pentru ' + orderLine.employeeName,           
            };
            modalService.confirm(modalOptions).then(function (result) {
                orderLineService.delete(orderLine._id).then(function () {
                    _.remove(vm.orderLines, {_id: orderLine._id});                  
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
            // search by orderLine name or email
            if (new RegExp(vm.search, 'i').test(item.name) || new RegExp(vm.search, 'i').test(item.email)) {
                    isMatch = true;
                }
            } else {
                // if nothing is entered, return all posts
                isMatch = true;
            }
            return isMatch;
        };          

        vm.refresh = function () {
            getOrderLines();
        };

        vm.goBack = function(){ 
            $window.history.back();
        }
        
        vm.preferencesFilter = function(preference){
            if(vm.selectedPreference === 'Toate pref.'){
                return true;
            } else if (vm.selectedPreference === 'A' || vm.selectedPreference === 'B'){
                return preference.option1 === vm.selectedPreference;
            } else if (vm.selectedPreference === 'C' || vm.selectedPreference === 'D'){
                return preference.option2 === vm.selectedPreference;
            } else if(vm.selectedPreference === 'Fara pref.'){
                return !(preference.option1 && preference.option2);
            }
        }
        
        vm.eatSeriesFilter = function(orderLine){
            if(vm.selectedEatSeries === 'Toate seriile'){
                return true;
            } else {
                return orderLine.eatSeries === vm.selectedEatSeries;
            }
        }        
        
        vm.badgesFilter = function(orderLine){
            if(vm.obj.onlyNoBadges){
                return !orderLine.badgeCode;
            } else return true;
        }           
        
        vm.selectOnlyNoBadges = function(){
            if(vm.obj.onlyNoBadges === false){
                vm.obj.onlyNoBadges = true;
                $location.search('onlyNoBadges', null); // delete property from url
            } else {
                vm.obj.onlyNoBadges = false;
                $location.search('onlyNoBadges', true); // add property to url
            }
        }    
        
        vm.selectEatSeries = function(eatSeries){
            if(eatSeries === 'Toate seriile'){
                vm.selectedEatSeries = 'Toate seriile';
                $location.search('eatSeries', null); // delete property from url
            } else {
                vm.selectedEatSeries = eatSeries;
                $location.search('eatSeries', eatSeries); // add property to url
            }
        }  
        
        vm.selectPreference = function(preference){
            if(preference === 'Toate pref.'){
                vm.selectedPreference = 'Toate pref.';
                $location.search('preference', null); // delete property from url
            } else {
                vm.selectedPreference = preference;
                $location.search('preference', preference); // add property to url
            }
        }         
                        
        //
        // private methods
        //
        function getOrderLines(){
            orderLineService.getAllWithBadgeInfo(vm.orderId).then(function (data) {
                vm.orderLines = data;
                
                vm.eatSeriesList = _.chain(vm.orderLines).map('eatSeries').uniq().sortBy().value();
                
                var searchObject = $location.search();
                
                if(searchObject.eatSeries)
                    vm.selectedEatSeries = searchObject.eatSeries;  
                else
                    vm.selectedEatSeries = 'Toate seriile';  
                    
                if(searchObject.preference)
                    vm.selectedPreference = searchObject.preference;  
                else
                    vm.selectedPreference = 'Toate pref.'; 
                    
                if(searchObject.onlyNoBadges)
                    vm.obj.onlyNoBadges = true;  
                else
                    vm.obj.onlyNoBadges = false;                                            
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            });
        }        
    }
    
})();