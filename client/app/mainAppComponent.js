(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("mainApp",{
        template:`
            <lm-navbar></lm-navbar>
            <ng-outlet></ng-outlet>
        `,
        $routeConfig:[
            //
            // home
            //
            {path:"/admin", component:"home", name:"Home"},            
            
            //
            // customerEmployee
            //
            {path:"/admin/customerEmployees", component:"customerEmployeeList", name:"CustomerEmployeeList"},
            {path:"/admin/customerEmployees/create", component:"customerEmployee", name:"CustomerEmployeeCreate"},
            {path:"/admin/customerEmployees/:id", component:"customerEmployee", name:"CustomerEmployeeEdit", data: { action: 'edit'}},
            
            //
            // user
            //
            {path:"/admin/users", component:"userList", name:"UserList"},
            {path:"/admin/users/create", component:"user", name:"UserCreate"},
            {path:"/admin/users/:id", component:"user", name:"UserEdit", data: { action: 'edit'}},
            
            //
            // dish
            //
            {path:"/admin/dishes", component:"dishList", name:"DishList"},
            {path:"/admin/dishes/create", component:"dish", name:"DishCreate"},
            {path:"/admin/dishes/:id", component:"dish", name:"DishEdit", data: { action: 'edit'}},     
            
            //
            // menu
            //
            {path:"/admin/menus", component:"menuList", name:"MenuList"},
            {path:"/admin/menus/:menuId/dishes/:dishId", component:"editDishForMenu", name:"EditDishForMenu"},
            {path:"/admin/menus/:id/add", component:"addDishToMenu", name:"AddDishToMenu"},
            
            //
            // preference
            //
            {path:"/admin/preferences", component:"preferenceList", name:"PreferenceList"},
            {path:"/admin/preferences/create", component:"addPreferences", name:"PreferenceCreate"},
            {path:"/admin/preferences/:id", component:"preference", name:"PreferenceEdit"},                            

            //
            // order
            //
            {path:"/admin/orders", component:"orderList", name:"OrderList"},
            // {path:"/admin/orders/create", component:"order", name:"OrdersCreate"},
            {path:"/admin/orders/:id", component:"order", name:"OrderEdit"},  
                        
            //{path:"/admin/**", redirectTo:["Home"]}
        ]
    });
    
})();


// 'use strict';

// app.config(['$routeProvider', function ($routeProvider) {
//     $routeProvider
//         .when('/admin/orders', {
//             controller: 'ordersController',
//             templateUrl: 'app/order/orders.html',
// 			title: 'Comenzi'
// 	    })    
// 	    .when('/admin/orders/create', {
// 	        controller: 'orderController',
// 	        templateUrl: 'app/order/order.html',
// 	        title: 'Adauga o comanda'
// 	    })
// 	    .when('/admin/orders/:id', {
// 	        controller: 'orderController',
// 	        templateUrl: 'app/order/order.html',
// 	        title: 'Comanda',
// 	        isEditMode: true
// 	    });	
// }]);