(function () {
    "use strict";
    var module = angular.module("celebrate-taste");
    module.component("home", {
        template: "\n            <div class=\"container\">    \n                </br>\n                </br>\n                <p ng-if-start=\"vm.isAdmin()\"><a ng-href=\"/admin/users\">Utilizatori</a></p>\n                <p><a ng-href=\"/admin/customerEmployees\">Angajati client</a></p>\n                <p><a ng-href=\"/admin/dishes\">Feluri de mancare</a></p>\n                <p><a ng-href=\"/admin/menus\">Meniuri</a></p>\n                <p><a ng-href=\"/admin/preferences\">Preferinte</a></p>\n                <p><a ng-href=\"/admin/orders\">Comenzi</a></p>\n                <p><a ng-href=\"/admin/deliveries\">Livrari</a></p>\n                <p ng-if-end><a ng-href=\"/admin/deliveryLogs\">Notificari</a></p>\n                <p><a ng-href=\"/admin/partnerOrders\">Raport comenzi</a></p>\n                <p><a ng-href=\"/admin/reviews\">Feedback clienti</a></p>\n                <p><a ng-href=\"/admin/assignedNames\">Asocieri de nume</a></p>\n            </div>        \n        ",
        controllerAs: "vm",
        controller: ["userService", controller]
    });
    function controller(userService) {
        var vm = this;
        vm.$onInit = function () {
            vm.isAdmin = userService.isAdmin;
        };
    }
})();
