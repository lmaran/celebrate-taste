(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    var id;
    
    module.component("addPreferences",{
        templateUrl:"app/preference/addPreferences.html",
        controllerAs:"vm",
        controller:["$route", "$window", "preferenceService", "helperValidator", "customerEmployeeService", "helperService", "toastr", "menuService", "$scope", controller]       
    });
       
    function controller($route, $window, preferenceService, helperValidator, customerEmployeeService, helperService, toastr, menuService, $scope){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.preference = {};
            vm.errors = {};              
            vm.pageTitle = "Adauga preferinte";
            vm.person = {};
            vm.customerEmployees = [];    
            vm.menus = [];
            vm.nextEmployeePreferences = [];    
            vm.preferences = [];        
        };
        
        vm.$routerOnActivate = function (next, previous) {
            id = next.params.id;
            getActiveMenus();
            getCustomerEmployees();
        };        
        
        
        //
        // public methods
        //            
        vm.create = function (form) {         
            validateForm(vm, form);
            if (form.$invalid) return false;

            // transform data
            var preferences = [];
            vm.preferences.forEach(function(preference){       
                if(!preference.alreadyAdded &&
                    (preference.option1 !== '' || preference.option2!== '')){
                    var newPreference = {
                        employeeName: vm.person.selected.name,
                        date: preference.date
                    };
                    
                    if(preference.option1 !== '')
                        newPreference.option1 = preference.option1.toUpperCase();
                    if(preference.option2 !== '')
                        newPreference.option2 = preference.option2.toUpperCase();
                                            
                    preferences.push(newPreference);
                }
            });

            if(preferences.length > 0){
                preferenceService.createMany(preferences)
                    .then(function (data) {
                        vm.person.selected = undefined; // clean screen
                        $scope.$broadcast('SetFocus'); // set focus on the employee field
                        toastr.success('Inregistrarea a fost adaugata!');                        
                    })
                    .catch(function (err) {
                        if(err.data.errors){                   
                            helperValidator.updateValidity(vm, form, err.data.errors);
                        } else{
                            alert(JSON.stringify(err.data, null, 4)); 
                        }
                    }) 
            } else {
                alert('Nu ai adaugat nicio preferinta!');
            }  
        }
        
        vm.selectEmployee = function(item, model){
            vm.preferencesHaveErrors = false; //reset errors, if exist
            getNextEmployeePreferences(item.name);       
        }        
        
        vm.dt = function (dateAsString) { // yyyy-mm-dd
            return helperService.getObjFromString(dateAsString);
        }        
        
        vm.goBack = function(){ 
            $window.history.back();
        }   
        
        
        //
        // private methods
        //        
        function getNextEmployeePreferences(employeeName) {
            preferenceService.getNextByEmployee(employeeName).then(function (data) {
                vm.nextEmployeePreferences = data;           
                vm.preferences = [];
                var isFirst = true; 

                vm.menus.forEach(function(menu, idx) {
                    //var alreadyAdded = _.some(data, {date: menu.menuDate});
                    var existingPreference = _.find(data, {date: menu.menuDate}); // returns the first matched element, else undefined.
                    var alreadyAdded = (existingPreference)? true : false;

                    var availableForOption1 = _.chain(menu.dishes).filter({category:'1'}).map('option').uniq().sortBy().value();
                    var availableForOption2 = _.chain(menu.dishes).filter({category:'2'}).map('option').uniq().sortBy().value();
                    
                    var isFocusOnOption1 = false;
                    var isFocusOnOption2 = false;
                    
                    if(!alreadyAdded && isFirst){
                        if(availableForOption1.length > 0){ // input for option1 is not disabled
                            isFocusOnOption1 =true;
                            isFirst = false;                        
                        } else {
                            if(availableForOption2.length > 0){ // input for option2 is not disabled
                                isFocusOnOption2 =true;
                                isFirst = false;                        
                            }                        
                        }
                    }

                    var preference = {
                        alreadyAdded: alreadyAdded,
                        date: menu.menuDate,
                        option1: (existingPreference)? existingPreference.option1: '',
                        option2: (existingPreference)? existingPreference.option2: '',
                        availableForOption1: availableForOption1, //usualy ["A", "B"]
                        availableForOption2: availableForOption2, //usualy ["C", "D"]
                        isFocusOnOption1 : isFocusOnOption1,
                        isFocusOnOption2 : isFocusOnOption2,
                        rowIndex: idx
                    };              
                    
                    vm.preferences.push(preference);
                });
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            })
        }     
        
        function getCustomerEmployees(){
            customerEmployeeService.getAll().then(function (data) {
                vm.customerEmployees = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            });
        }
        
        function getActiveMenus(){
            menuService.getActiveMenus().then(function (data) {
                vm.menus = data;
                vm.menuIsReady = true; //prevent displaying a wrong message for a short time
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });        
        }               

        function validateForm(vm, form){ 
            helperValidator.setAllFildsAsValid(form);
            
            vm.preferencesHaveErrors = false;
            
            var thereArePreferences = false;
            vm.preferences.some(function(p){       
                if(!p.alreadyAdded){ // validate only what is suposed to be saved
                    
                    // validate option1
                    var option1 = p.option1.toUpperCase();
                    if(option1.length === 1){ // something was introduced 
                        thereArePreferences = true;             
                        if(p.availableForOption1.indexOf(option1) === -1){
                            var fieldIdx1 = 2 * p.rowIndex;
                            var field1 = 'input' + fieldIdx1.toString();
                            form[field1].$setValidity('myValidation', false);
                            vm.errors.preferences = 'Ai introdus un cod invalid.';  
                            vm.preferencesHaveErrors = true;  
                            return true; //break the loop                         
                        }
                    }
                    
                    // validate option2
                    var option2 = p.option2.toUpperCase();
                    if(option2.length === 1){ // something was introduced 
                        thereArePreferences = true;             
                        if(p.availableForOption2.indexOf(option2) === -1){
                            var fieldIdx2 = 2 * p.rowIndex + 1;
                            var field2 = 'input' + fieldIdx2.toString();
                            form[field2].$setValidity('myValidation', false);
                            vm.errors.preferences = 'Ai introdus un cod invalid.';  
                            vm.preferencesHaveErrors = true;  
                            return true; //break the loop                         
                        }
                    }
                                    
                }
            });
            
            // // check if there are new preferences
            // if(!thereArePreferences){
            //     //vm.form = {};
            //     vm.form.$invalid = true;
            //     //form.$setValidity('myValidation', false); // ok si asta            
            //     vm.errors.preferences = 'Nu ai adaugat optiuni noi.';  
            //     vm.preferencesHaveErrors = true;             
            // }
            
            return vm.preferencesHaveErrors;
        }  
    
    }
    
    
    /* jshint ignore:start */
    // inspired by: http://stackoverflow.com/a/28450002/2726725
    // in the table cell we have only one input element -> next() function returns nothing
    // get the next input element by "id"
    module.directive("moveNextOnMaxlength", function() {
        return {
            restrict: "A",
            link: function($scope, element) {
                element.on("input", function(e) {
                    if(element.val().length == element.attr("maxlength")) {
                        var currentId = element[0].id;
                        var nextId = parseInt(currentId) + 1;
                        var $nextElement = angular.element(document.getElementById(nextId.toString()));
                        
                        // skip over disabled input elements
                        while($nextElement.length && $nextElement[0].disabled){
                            currentId = $nextElement[0].id;
                            nextId = parseInt(currentId) + 1;
                            $nextElement = angular.element(document.getElementById(nextId.toString()));                        
                        };
                        
                        if($nextElement.length) {
                            $nextElement[0].focus();
                        }
                    }
                });
            }
        }
    });
    /* jshint ignore:end */    
    
})();