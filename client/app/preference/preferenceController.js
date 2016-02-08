/*global app*/
/* global _ */
'use strict';

app.controller('preferenceController', ['$scope', '$route', 'preferenceService', '$location', 'helperValidator','menuService','customerEmployeeService', 'helperService', 'toastr',
    function ($scope, $route, preferenceService, $location, helperValidator, menuService, customerEmployeeService, helperService, toastr) {
        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.errors = {};
    $scope.preference = {};

    $scope.person = {};

    $scope.customerEmployees = [];
    
    $scope.menus = [];
    
    $scope.nextEmployeePreferences = [];
    
    $scope.selectEmployee = function(item, model){
        $scope.preferencesHaveErrors = false; //reset errors, if exist
        getNextEmployeePreferences(item.name);       
    }
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    } else{
        getActiveMenus();
        getCustomerEmployees();
    }

    function init() {
        getpreference();
    } 

    function getpreference() {
        preferenceService.getById($route.current.params.id).then(function (data) {
            $scope.preference = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        })
    } 
    
    $scope.preferences = [];
    function getNextEmployeePreferences(employeeName) {
        preferenceService.getNextByEmployee(employeeName).then(function (data) {
            $scope.nextEmployeePreferences = data;           
            $scope.preferences = [];
            var isFirst = true; 

            $scope.menus.forEach(function(menu, idx) {
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
                
                $scope.preferences.push(preference);
            });
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        })
    }     
    
    function getCustomerEmployees(){
        customerEmployeeService.getAll().then(function (data) {
            $scope.customerEmployees = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }
    
    function getActiveMenus(){
        menuService.getActiveMenus().then(function (data) {
            $scope.menus = data;
            $scope.menuIsReady = true; //prevent displaying a wrong message for a short time
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });        
    }  

    $scope.create = function (form) {         
        validateForm($scope, form);
        if (form.$invalid) return false;

        // transform data
        var preferences = [];
        $scope.preferences.forEach(function(preference){       
            if(!preference.alreadyAdded &&
                (preference.option1 !== '' || preference.option2!== '')){
                var newPreference = {
                    employeeName: $scope.person.selected.name,
                    date: preference.date
                };
                
                if(preference.option1 !== '')
                    newPreference.option1 = preference.option1.toUpperCase();
                if(preference.option2 !== '')
                    newPreference.option2 = preference.option2.toUpperCase();
                                        
                preferences.push(newPreference);
            }
        });

        
        
        preferenceService.createMany(preferences)
            .then(function (data) {
                toastr.success('Inregistrarea a fost adaugata!');
                $scope.person.selected = undefined; // clean screen
                $scope.$broadcast('SetFocus'); // set focus on the employee field
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            })     
    }

    $scope.update = function (form) {
        // validateForm($scope, form);
        // if (form.$invalid) return false;
            
        preferenceService.update($scope.preference)
            .then(function (data) {
                $location.path('/admin/preferences');
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            });
    };
    
    function validateForm($scope, form){ 
        helperValidator.setAllFildsAsValid(form);
        
        $scope.preferencesHaveErrors = false;
        
        var thereArePreferences = false;
        $scope.preferences.some(function(p){       
            if(!p.alreadyAdded){ // validate only what is suposed to be saved
                
                // validate option1
                var option1 = p.option1.toUpperCase();
                if(option1.length === 1){ // something was introduced 
                    thereArePreferences = true;             
                    if(p.availableForOption1.indexOf(option1) === -1){
                        var fieldIdx1 = 2 * p.rowIndex;
                        var field1 = 'input' + fieldIdx1.toString();
                        form[field1].$setValidity('myValidation', false);
                        $scope.errors.preferences = 'Ai introdus un cod invalid.';  
                        $scope.preferencesHaveErrors = true;  
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
                        $scope.errors.preferences = 'Ai introdus un cod invalid.';  
                        $scope.preferencesHaveErrors = true;  
                        return true; //break the loop                         
                    }
                }
                                
            }
        });
        
        // check if there are new preferences
        if(!thereArePreferences){
            $scope.form.$invalid = true;
            //form.$setValidity('myValidation', false); // ok si asta            
            $scope.errors.preferences = 'Nu ai adaugat optiuni noi.';  
            $scope.preferencesHaveErrors = true;             
        }
        
        return $scope.preferencesHaveErrors;
    }  
      
    $scope.dt = function (dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    }
    
}])

/* jshint ignore:start */
// inspired by: http://stackoverflow.com/a/28450002/2726725
// in the table cell we have only one input element -> next() function returns nothing
// get the next input element by "id"
app.directive("moveNextOnMaxlength", function() {
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