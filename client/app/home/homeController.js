'use strict';
 
app.controller('homeController', ['$scope', 'menuService', function ($scope, menuService) {
    $scope.todaysMenu={};

    var getTodaysMenu = function(){
        
        menuService.getTodaysMenu().then(function(result){
            $scope.todaysMenu = result;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    };
    
    var init = function(){
        getTodaysMenu();
    };  
    
    init();
    
    var getToday = function() {
        var today = new Date();
        
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();  
        
        if(dd<10) dd='0'+dd;
        
        // if(mm<10) {
        //     mm='0'+mm
        // }              
        
        var getRoDay = function(dayOfWeek){
            console.log(dayOfWeek);
            if(dayOfWeek == 0) return 'Duminica';
            else if(dayOfWeek == 1) return 'Luni';
            else if(dayOfWeek == 2) return 'Marti'; 
            else if(dayOfWeek == 3) return 'Miercuri'; 
            else if(dayOfWeek == 4) return 'Joi'; 
            else if(dayOfWeek == 5) return 'Vineri'; 
            else if(dayOfWeek == 6) return 'Sambata';
        };
        
        var getRoMonth = function(monthOfYear){
            if(monthOfYear == 0) return 'Ianuarie';
            else if(monthOfYear == 1) return 'Februari';
            else if(monthOfYear == 2) return 'Martie'; 
            else if(monthOfYear == 3) return 'Aprilie'; 
            else if(monthOfYear == 4) return 'Mai'; 
            else if(monthOfYear == 5) return 'Iunie'; 
            else if(monthOfYear == 6) return 'Iulie';
            else if(monthOfYear == 7) return 'August';
            else if(monthOfYear == 8) return 'Septembrie'; 
            else if(monthOfYear == 9) return 'Octombrie'; 
            else if(monthOfYear == 10) return 'Noiembrie'; 
            else if(monthOfYear == 11) return 'Decembrie';           
        };        
        
        return{
            dayAsString:getRoDay(today.getDay()), // Joi
            dayOfMonth:dd, // 07
            monthAsString:getRoMonth(mm), // Aprilie
            year:yyyy
        }
    };
    
    $scope.today=getToday();
        
}]);