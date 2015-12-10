'use strict';

app.factory('helperService', [function(){
	var factory = {};
	
	// *********** date/time helpers
	
	factory.getRoDay = function(dayOfWeek){
		if(dayOfWeek === 0) return 'Duminica';
		else if(dayOfWeek === 1) return 'Luni';
		else if(dayOfWeek === 2) return 'Marti'; 
		else if(dayOfWeek === 3) return 'Miercuri'; 
		else if(dayOfWeek === 4) return 'Joi'; 
		else if(dayOfWeek === 5) return 'Vineri'; 
		else if(dayOfWeek === 6) return 'Sambata';
	};
	
	factory.getRoMonth = function(monthOfYear){
		if(monthOfYear === 0) return 'Ianuarie';
		else if(monthOfYear === 1) return 'Februari';
		else if(monthOfYear === 2) return 'Martie'; 
		else if(monthOfYear === 3) return 'Aprilie'; 
		else if(monthOfYear === 4) return 'Mai'; 
		else if(monthOfYear === 5) return 'Iunie'; 
		else if(monthOfYear === 6) return 'Iulie';
		else if(monthOfYear === 7) return 'August';
		else if(monthOfYear === 8) return 'Septembrie'; 
		else if(monthOfYear === 9) return 'Octombrie'; 
		else if(monthOfYear === 10) return 'Noiembrie'; 
		else if(monthOfYear === 11) return 'Decembrie';           
	}; 
	
	factory.getFriendlyDate = function(date){ // javascript date object
		var d = date.getDate();
        var m = date.getMonth()+1; // January is 0!
        var yyyy = date.getFullYear();  
        
        var dd = d; 
        if(dd < 10) dd = '0' + d;
        
        var mm = m;
        if(mm < 10) m = '0' + m; 
		
        return{
            dayAsString: this.getRoDay(date.getDay()), // Joi
            dayOfMonth:dd, // 07, 24

            monthAsString:this.getRoMonth(m-1), // Aprilie
            year:yyyy, // 2015
			ymd: yyyy + '-' + mm + '-' + dd // 2015-07-23
        }		
	}
	
	factory.getDateFromString = function(date){	// "yyyy-mm-dd"
		var array = date.split('-');		
		var mm = array[1];
		if(mm[0] === '0') mm = mm.charAt(1); // 07 -> 7 (month)
		mm = mm - 1; // January is 0!
		return new Date(array[0], mm, array[2]);
	}
	
	factory.getStringFromString = function(dateStr){	// "yyyy-mm-dd"
		var date = this.getDateFromString(dateStr);
		var f = this.getFriendlyDate(date);
		var dateStrRo = f.dayAsString + ', ' + f.dayOfMonth + ' ' + f. monthAsString + ' ' + f.year;
		return dateStrRo; // "Joi, 07 Aprilie 2015"
	}	
	
	factory.getStringFromDate = function(date){	// javascript date object		
		return this.getFriendlyDate(date).ymd;
	}	
	
	
	// *********** random string generator 
	// source: http://stackoverflow.com/a/1349426
	// alternative: https://gist.github.com/gordonbrander/2230317

	factory.makeId = function(len)
	{
		var text = '';
		//var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var possible = 'abcdef0123456789';
	
		for( var i=0; i < len; i=i+1 )
			text += possible.charAt(Math.floor(Math.random() * possible.length));
	
		return text; // ex: len=8 -> "c5de7ce4"
	}	
	
	// *********** others
	
	factory.setAllFildsAsValid = function(form){
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
		}); 		
	} 	
	
	return factory;	
}]);


