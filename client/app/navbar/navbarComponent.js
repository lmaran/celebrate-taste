(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("lmNavbar",{
        templateUrl:"app/navbar/navbar.html",
        controllerAs:"vm",
        controller:["$http", "userService", "$location", controller]
    });
    
    function controller($http, userService, $location){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.isCollapsed = true;   
            vm.isLoggedIn = userService.isLoggedIn;
            vm.isAdmin = userService.isAdmin;
            vm.isPartnerOrAdmin = userService.isPartnerOrAdmin;
            vm.getCurrentUser = userService.getCurrentUser;
            //vm.buildInfo = {};
        };
        
        vm.isActive = function (route) {
            return route === $location.path();
        };
    }
    
})();