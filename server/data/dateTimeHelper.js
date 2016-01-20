'use strict';

	var factory = {};
	
	// *********** date/time helpers
	
	factory.getRoDay = function(dayOfWeek){
		if(dayOfWeek === 0) return 'Duminica';
		else if(dayOfWeek === 1) return 'luni';
		else if(dayOfWeek === 2) return 'marti'; 
		else if(dayOfWeek === 3) return 'miercuri'; 
		else if(dayOfWeek === 4) return 'joi'; 
		else if(dayOfWeek === 5) return 'vineri'; 
		else if(dayOfWeek === 6) return 'sambata';
	};
    
	factory.getRoShortDay = function(dayOfWeek){
		if(dayOfWeek === 0) return 'Du';
		else if(dayOfWeek === 1) return 'Lu';
		else if(dayOfWeek === 2) return 'Ma'; 
		else if(dayOfWeek === 3) return 'Mi'; 
		else if(dayOfWeek === 4) return 'Jo'; 
		else if(dayOfWeek === 5) return 'Vi'; 
		else if(dayOfWeek === 6) return 'Sa';
	};    
	
	factory.getRoMonth = function(monthOfYear){
		if(monthOfYear === 0) return 'ianuarie';
		else if(monthOfYear === 1) return 'februari';
		else if(monthOfYear === 2) return 'martie'; 
		else if(monthOfYear === 3) return 'aprilie'; 
		else if(monthOfYear === 4) return 'mai'; 
		else if(monthOfYear === 5) return 'iunie'; 
		else if(monthOfYear === 6) return 'iulie';
		else if(monthOfYear === 7) return 'august';
		else if(monthOfYear === 8) return 'septembrie'; 
		else if(monthOfYear === 9) return 'octombrie'; 
		else if(monthOfYear === 10) return 'noiembrie'; 
		else if(monthOfYear === 11) return 'decembrie';           
	}; 
    
	factory.getRoShortMonth = function(monthOfYear){
		if(monthOfYear === 0) return 'Ian.';
		else if(monthOfYear === 1) return 'Feb.';
		else if(monthOfYear === 2) return 'Mar.'; 
		else if(monthOfYear === 3) return 'Apr.'; 
		else if(monthOfYear === 4) return 'Mai'; 
		else if(monthOfYear === 5) return 'Iun.'; 
		else if(monthOfYear === 6) return 'Iul.';
		else if(monthOfYear === 7) return 'Aug.';
		else if(monthOfYear === 8) return 'Sep.'; 
		else if(monthOfYear === 9) return 'Oct.'; 
		else if(monthOfYear === 10) return 'Nov.'; 
		else if(monthOfYear === 11) return 'Dec.';           
	};     
	
	factory.getFriendlyDate = function(date){ // javascript date object
		var d = date.getDate();
        var m = date.getMonth()+1; // January is 0!
        var yyyy = date.getFullYear();  
        
        var dd = d; 
        if(dd < 10) dd = '0' + d;
        
        var mm = m;
        if(mm < 10) mm = '0' + m; 
		
        return{
            dayAsString: this.getRoDay(date.getDay()), // Joi
			dayAsShortString: this.getRoShortDay(date.getDay()), // Jo
            dayOfMonth:dd, // 07, 24            

            monthAsString:this.getRoMonth(m-1), // Aprilie
            monthAsShortString:this.getRoShortMonth(m-1), // Apr.
            year:yyyy, // 2015
			ymd: yyyy + '-' + mm + '-' + dd, // 2015-07-23
			dmy: dd + '.' + mm + '.' + yyyy // 23.07.2015
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
	
module.exports = factory;