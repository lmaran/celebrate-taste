'use strict';

app.factory('dayTimeService', [function(){
	var factory = {};
	
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
	
	factory.getFriendlyDate = function(date){
		var dd = date.getDate();
        var mm = date.getMonth()+1; // January is 0!
        var yyyy = date.getFullYear();  
        
        var dd0 = dd; 
        if(dd0 < 10) dd0 = '0' + dd;
        
        var mm0 = mm;
        if(mm0 < 10) mm = '0' + mm; 
		
        return{
            dayAsString: this.getRoDay(date.getDay()), // Joi
            dayOfMonth:dd0, // 07, 24

            monthAsString:this.getRoMonth(mm), // Aprilie
            year:yyyy, // 2015
			ymd: yyyy + '-' + mm0 + '-' + dd0 // 2015-07-23
        }		
	}
	
	factory.getDateFromString = function(date){	// "yyyy-mm-dd"
		var array = date.split('-');
		
		var mm = array[1];
		if(mm[0] === '0') mm = mm.charAt(1); // 07 -> 7 (month)
		mm = mm - 1; // January is 0!
		
		return new Date(array[0], mm, array[2]);
	}
	
	return factory;	
}]);

