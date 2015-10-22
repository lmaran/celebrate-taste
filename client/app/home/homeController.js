'use strict';
 
app.controller('homeController', ['$scope', 'menuService', 'dayTimeService',
    function ($scope, menuService, dayTimeService) {
        
    $scope.todaysMenu={};
    
    $scope.today = dayTimeService.getFriendlyDate(new Date());
    
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