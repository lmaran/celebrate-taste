(function() {	
            
    var dateStr = getStringFromDate(new Date()); // yyyy-mm-dd
    
    var link1 = document.getElementById("todaysMenuNavbarLnk");
    link1.setAttribute('href', "/todaysMenu?today=" + dateStr);
    
    var link2 = document.getElementById("nextMenusNavbarLnk");
    link2.setAttribute('href', "/nextMenus?today=" + dateStr);
    
    function getStringFromDate(date){ // javascript date object
        var d = date.getDate();
        var m = date.getMonth()+1; // January is 0!
        var yyyy = date.getFullYear();  
        
        var dd = d; 
        if(dd < 10) dd = '0' + d;
        
        var mm = m;
        if(mm < 10) mm = '0' + m; 
        
        return yyyy + '-' + mm + '-' + dd // 2015-07-23		
    }
    
})();