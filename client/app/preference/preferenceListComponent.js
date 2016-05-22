(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("preferenceList",{
        templateUrl:"app/preference/preferenceList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "preferenceService", "modalService", "toastr", "helperService", controller]     
    });
       
    function controller($location, $window, preferenceService, modalService, toastr, helperService){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Preferinte";
            vm.preferences = [];
            vm.errors = {}; 
            vm.nextDates=[]; 
            vm.obj = {};
            vm.obj.onlyFromOnline = false;               
            
            getNextDates();
        };
        
        
        //
        // public methods
        //       
        vm.create = function () {
            $location.path('/admin/preferences/create');
        }
        
        vm.delete = function (preference) {
            var modalOptions = {
                bodyDetails: preference.name,           
            };
            modalService.confirm(modalOptions).then(function (result) {
                preferenceService.delete(preference._id).then(function () {
                    _.remove(vm.preferences, {_id: preference._id});                   
                })
                .catch(function (err) {
                    vm.errors = JSON.stringify(err.data, null, 4);
                    alert(vm.errors);
                });
            });
        };

        // vm.filterBySearch = function (item) {
        //     var isMatch = false;
        //     if (vm.search) {
        //     // search by preference name or email
        //     if (new RegExp(vm.search, 'i').test(item.name) || new RegExp(vm.search, 'i').test(item.email)) {
        //             isMatch = true;
        //         }
        //     } else {
        //         // if nothing is entered, return all posts
        //         isMatch = true;
        //     }
        //     return isMatch;
        // };
        
        vm.filterByOnline = function(orderLine){
            if(vm.obj.onlyFromOnline) {
                return orderLine.fromOnline;
            } else return true;
        }                   

        vm.refresh = function () {
            getNextDates();
        };

        vm.goBack = function(){ 
            $window.history.back();
        }
        
        vm.dt = function (dateAsString) { // yyyy-mm-dd
            return helperService.getObjFromString(dateAsString);
        } 
        
        vm.selectOnlyFromOnline = function(){
            if(vm.obj.onlyFromOnline === false){
                $location.search('onlyFromOnline', null); // delete property from url
            } else {
                $location.search('onlyFromOnline', true); // add property to url
            }
        }  
        
        vm.selectDate = function(date){
            if(date !== 'Nu exista date'){
                vm.selectedDate = date;

                $location.search('date', date); // add property to url
                getPreferencesByDay(vm.selectedDate);
            }
        }                  
        
                        
        //
        // private methods
        //
        function getNextDates(){
            preferenceService.getNextDates().then(function (data) {
                vm.nextDates = data;
                
                var searchObject = $location.search();
                if(searchObject.date)
                    vm.selectedDate = searchObject.date;
                else{
                    if(vm.nextDates.length === 0)
                        vm.nextDates.push('Nu exista date');
                    else
                        vm.selectedDate = vm.nextDates[0];    
                }
                
                // get preferences for the selected day
                if(vm.selectedDate)
                    getPreferencesByDay(vm.selectedDate);  
                    
                if(searchObject.onlyFromOnline)
                    vm.obj.onlyFromOnline = true;  
                else
                    vm.obj.onlyFromOnline = false;                         
                                    
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        } 
        
        function getPreferencesByDay(dayStr){
            preferenceService.getByDate(dayStr).then(function (data) {
                vm.preferences = data;
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });          
        }
                   
    }
    
})();