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
            // customerEmployees
            //
            {path:"/admin/customerEmployees", component:"customerEmployeeList", name:"CustomerEmployeeList"},
            {path:"/admin/customerEmployees/create", component:"customerEmployee", name:"CustomerEmployeeCreate"},
            {path:"/admin/customerEmployees/:id", component:"customerEmployee", name:"CustomerEmployeeEdit", data: { action: 'edit'}}
            
            //{path:"/admin/**", redirectTo:["Home"]}
        ]
    });
    
})();