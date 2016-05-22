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
            // {path:"/admin/menus/create", component:"menu", name:"MenuCreate"},
            // {path:"/admin/menus/:id", component:"menu", name:"DishEdit", data: { action: 'edit'}}  
            {path:"/admin/menus/:menuId/dishes/:dishId", component:"menuItem", name:"MenuItem"},
            {path:"/admin/menus/:id/add", component:"addToMenu", name:"AddToMenu"}                  
                        
            //{path:"/admin/**", redirectTo:["Home"]}
        ]
    });
    
})();
