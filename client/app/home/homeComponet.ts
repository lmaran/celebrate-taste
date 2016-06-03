(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("home",{
        template:`
            <div class="container">    
                </br>
                </br>
                <p ng-if-start="vm.isAdmin()"><a ng-href="/admin/users">Utilizatori</a></p>
                <p><a ng-href="/admin/customerEmployees">Angajati client</a></p>
                <p><a ng-href="/admin/dishes">Feluri de mancare</a></p>
                <p><a ng-href="/admin/menus">Meniuri</a></p>
                <p><a ng-href="/admin/preferences">Preferinte</a></p>
                <p><a ng-href="/admin/orders">Comenzi</a></p>
                <p><a ng-href="/admin/deliveries">Livrari</a></p>
                <p ng-if-end><a ng-href="/admin/deliveryLogs">Notificari</a></p>
                <p><a ng-href="/admin/partnerOrders">Raport comenzi</a></p>
            </div>        
        `,
        controllerAs:"vm",
        controller:["userService", controller]       
    });
       
    function controller(userService){
        var vm = this;

        vm.$onInit = function(){
            vm.isAdmin = userService.isAdmin;
        };   
    }
    
})();