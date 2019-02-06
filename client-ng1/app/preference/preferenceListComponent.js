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
            vm.option1Summary = [];
            vm.option2Summary = [];

            getNextDates();
        };
        
        
        //
        // public methods
        //       
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
            }, function() {
                // Cancel button
            });  
        };

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
                setOption1Summary(vm.preferences);
                setOption2Summary(vm.preferences);
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });          
        }

        function setOption1Summary(preferences){
            preferences.forEach(function(preference) {
                if(!preference.option1){
                    preference.option1 = "-";
                }
                var optionFound = _.find(vm.option1Summary, {key:preference.option1 });
                if(optionFound) {
                    optionFound.total+=1;
                } else {
                    vm.option1Summary.push({
                        key: preference.option1,
                        total: 1
                    });
                }
            });
        }

        function setOption2Summary(preferences){
            preferences.forEach(function(preference) {
                if(!preference.option2){
                    preference.option2 = "-";
                }
                var optionFound = _.find(vm.option2Summary, {key:preference.option2});
                if(optionFound) {
                    optionFound.total+=1;
                } else {
                    vm.option2Summary.push({
                        key: preference.option2,
                        total: 1
                    });
                }
            });
        }
                   
    }
    
})();