'use strict';
 
app.controller('todayMenuController', ['$scope', 'menuService', 'helperService',
    function ($scope, menuService, helperService) {
        
    $scope.todaysMenu={};
    
    $scope.today = helperService.getFriendlyDate(new Date());
    
    var getTodaysMenu = function(){
        var today = $scope.today.ymd; // "yyyy-mm-dd"

        menuService.getMenu(today).then(function(result){
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
        
}]);