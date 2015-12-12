/* global angular */
'use strict';
//Dan Whalin: http://stackoverflow.com/a/29602528
//http://blog.thoughtram.io/angular/2015/07/07/service-vs-factory-once-and-for-all.html

// !!! remember to deactivate all angular validations (e.g: required, minlength etc)

app.service('helperValidator', [function () {       
    
    this.required50 = function($scope, form, entity, field){
        $scope[entity][field] = $scope[entity][field] || '';
        var fieldValue = $scope[entity][field];

        if(fieldValue === ''){
            setValidity($scope, form, field, 'Acest camp este obligatoriu.');
        }
        else if(fieldValue.length > 50)
            setValidity($scope, form, field, 'Maxim 50 caractere.'); 
        else
            form[field].$setValidity('myValidation', null); // set field as valid
    }

    // if you use type="email" (e.g. for contextual keyboard) you must also use 'stop-email-validation' directive
    // othewise, the field is not filled (no data binding) until data is valid
    this.requiredEmail = function($scope, form, entity, field){
        var fieldValue = $scope[entity][field];

        if(fieldValue === undefined || fieldValue === ''){
            setValidity($scope, form, field, 'Acest camp este obligatoriu.');
        }          
        else if(!isEmail(fieldValue))
            setValidity($scope, form, field, 'Adresa de email invalida.'); 
        else if(fieldValue.length > 50)
            setValidity($scope, form, field, 'Maxim 50 caractere.');              
        else
            form[field].$setValidity('myValidation', null); // set field as valid
    } 

    // if you use type="email" (e.g. for contextual keyboard) you must also use 'stop-email-validation' directive
    // othewise, the field is not filled (no data binding) until data is valid
    this.optionalEmail = function($scope, form, entity, field){
        var fieldValue = $scope[entity][field];

        if(fieldValue === undefined || fieldValue === ''){
            form[field].$setValidity('myValidation', null); // set field as valid
        }          
        else if(!isEmail(fieldValue))
            setValidity($scope, form, field, 'Adresa de email invalida.'); 
        else if(fieldValue.length > 50)
            setValidity($scope, form, field, 'Maxim 50 caractere.');              
        else
            form[field].$setValidity('myValidation', null); // set field as valid
    } 
    
    this.optional50 = function($scope, form, entity, field){
        var fieldValue = $scope[entity][field];

        if(fieldValue === undefined || fieldValue === ''){
            form[field].$setValidity('myValidation', null); // set field as valid
        }          
        else if(fieldValue.length > 50)
            setValidity($scope, form, field, 'Maxim 50 caractere.');              
        else
            form[field].$setValidity('myValidation', null); // set field as valid
    }     
        
    this.updateValidity = function($scope, form, errors){
        setAllFildsAsValid(form);
        // Update validity of form fields that match the server errors                        
        angular.forEach(errors, function(item, idx) {  
            setValidity($scope, form, item.field, item.msg);                 
        })
    }

	function setAllFildsAsValid(form){
		// http://stackoverflow.com/a/31012883/2726725
		// iterate over all from properties
		angular.forEach(form, function(ctrl, name) {
			// ignore angular fields and functions
			if (name.indexOf('$') !== 0) {
				// iterate over all $errors for each field        
				angular.forEach(ctrl.$error, function(value, name) {
                    // set all fields as valid
                    ctrl.$setValidity(name, null);
				});
			}
		}) 		
	} 
    
    function setValidity($scope, form, field, msg){
        form[field].$setValidity('myValidation', false);
        $scope.errors[field] = msg; 
    }
      
    
	function isEmail(email) {
		// http://stackoverflow.com/a/46181/2726725
		var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}
    
    
}])