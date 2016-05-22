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
            // customerEmployees
            //
            {path:"/admin/customerEmployees", component:"customerEmployeeList", name:"CustomerEmployeeList"},
            {path:"/admin/customerEmployees/create", component:"customerEmployee", name:"CustomerEmployeeCreate"},
            {path:"/admin/customerEmployees/:id", component:"customerEmployee", name:"CustomerEmployeeEdit", data: { action: 'edit'}},
            
            //
            // users
            //
            {path:"/admin/users", component:"userList", name:"UserList"},
            {path:"/admin/users/create", component:"user", name:"UserCreate"},
            {path:"/admin/users/:id", component:"user", name:"UserEdit", data: { action: 'edit'}}
                        
            //{path:"/admin/**", redirectTo:["Home"]}
        ]
    });
    
})();