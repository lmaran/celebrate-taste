"use strict";var app=angular.module("celebrate-taste",["ngResource","ngSanitize","ngRoute","ui.bootstrap"]);app.config(["$routeProvider","$locationProvider","$httpProvider",function(e,t,o){e.otherwise({redirectTo:"/"}),t.html5Mode(!0),o.interceptors.push("authInterceptor")}]),app.run(["$rootScope","$location","Auth",function(e,t,o){e.$on("$routeChangeStart",function(e,n){o.isLoggedInAsync(function(o){n.authenticate&&!o&&(e.preventDefault(),t.path("/login"))})}),e.$on("$routeChangeSuccess",function(t,o,n){o.hasOwnProperty("$$route")&&(e.pageTitle=o.$$route.title)})}]),app.config(["$routeProvider",function(e){e.when("/login",{controller:"loginController",templateUrl:"app/account/login/login.html",title:"Autentificare"}).when("/signup",{controller:"signupController",templateUrl:"app/account/signup/signup.html",title:"Inregistrare"}).when("/changePassword",{controller:"changePasswordController",templateUrl:"app/account/changePassword/changePassword.html",title:"Schimba parola",authenticate:!0}).when("/resetpassword",{controller:"resetPasswordController",templateUrl:"app/account/resetPassword/forgotPassword.html",title:"Reseteaza parola"}).when("/resetpassword:ptoken",{controller:"resetPasswordController",templateUrl:"app/account/resetPassword/resetPassword.html",title:"Reseteaza parola"})}]),app.controller("adminController",["$scope","$http","Auth","User",function(e,t,o,n){e.users=n.query(),e["delete"]=function(t){n.remove({id:t._id}),angular.forEach(e.users,function(o,n){o===t&&e.users.splice(n,1)})}}]),app.config(["$routeProvider",function(e){e.when("/admin",{controller:"adminController",templateUrl:"app/admin/admin.html"})}]),app.factory("authInterceptor",["$rootScope","$q","$location","$rootElement","$window",function(e,t,o,n,r){var i=n.attr("ng-app"),c=i+"_token";return{request:function(e){e.headers=e.headers||{};var t=r.localStorage.getItem(c);return t&&(e.headers.Authorization="Bearer "+t),e},responseError:function(e){return 401===e.status?(o.path("/login"),r.localStorage.removeItem(c),t.reject(e)):t.reject(e)}}}]),app.factory("Auth",["$location","$rootScope","$http","User","$q","$rootElement","$window",function(e,t,o,n,r,i,c){var a=i.attr("ng-app"),l=a+"_token",s={};return c.localStorage.getItem(l)&&(s=n.get()),{login:function(e,t){var i=t||angular.noop,a=r.defer();return o.post("/auth/local",{email:e.email,password:e.password}).success(function(e){return c.localStorage.setItem(l,e.token),s=n.get(),a.resolve(e),i()}).error(function(e){return this.logout(),a.reject(e),i(e)}.bind(this)),a.promise},logout:function(){c.localStorage.removeItem(l),s={}},createUser:function(e,t){var o=t||angular.noop;return n.save(e,function(t){return c.localStorage.setItem(l,t.token),s=n.get(),o(e)},function(e){return this.logout(),o(e)}.bind(this)).$promise},changePassword:function(e,t,o){var r=o||angular.noop;return n.changePassword({id:s._id},{oldPassword:e,newPassword:t},function(e){return r(e)},function(e){return r(e)}).$promise},getCurrentUser:function(){return s},isLoggedIn:function(){return s.hasOwnProperty("role")},isLoggedInAsync:function(e){s.hasOwnProperty("$promise")?s.$promise.then(function(){e(!0)})["catch"](function(){e(!1)}):e(s.hasOwnProperty("role")?!0:!1)},isAdmin:function(){return"admin"===s.role},getToken:function(){return c.localStorage.getItem(l)}}}]),app.factory("User",["$resource",function(e){return e("/api/users/:id/:controller",{id:"@_id"},{changePassword:{method:"PUT",params:{controller:"password"}},get:{method:"GET",params:{id:"me"}}})}]),app.controller("contactController",["$scope",function(e){}]),app.config(["$routeProvider",function(e){e.when("/contact",{controller:"contactController",templateUrl:"app/contact/contact.html"})}]),app.directive("googleMap",["$rootScope","loadGoogleMapAPI",function(e,t){return{restrict:"C",scope:{mapId:"@id",lat:"@","long":"@",title:"@"},link:function(e,o,n){angular.isDefined(e.lat)&&angular.isDefined(e["long"])&&(e.initialize=function(){e.location=new google.maps.LatLng(e.lat,e["long"]),e.mapOptions={zoom:16,center:e.location},e.map=new google.maps.Map(document.getElementById(e.mapId),e.mapOptions);new google.maps.Marker({position:e.location,map:e.map,title:e.title})},t.then(function(){e.initialize()},function(){}))}}}]),app.service("loadGoogleMapAPI",["$window","$q",function(e,t){function o(){var e=document.createElement("script");e.src="//maps.googleapis.com/maps/api/js?sensor=false&language=en&callback=initMap",document.body.appendChild(e)}var n=t.defer();return e.initMap=function(){n.resolve()},o(),n.promise}]),app.controller("customerController",["$scope","$window","$route","customerService","$location",function(e,t,o,n,r){function i(){c()}function c(){n.getById(o.current.params.id).then(function(t){e.customer=t})["catch"](function(e){alert(JSON.stringify(e,null,4))})}e.isEditMode=o.current.isEditMode,e.isFocusOnName=e.isEditMode?!1:!0,e.customer={},e.isEditMode&&i(),e.create=function(t){e.submitted=!0,t.$valid&&n.create(e.customer).then(function(e){r.path("/customers")})["catch"](function(e){alert(JSON.stringify(e.data,null,4))})},e.update=function(t){e.submitted=!0,t.$valid&&n.update(e.customer).then(function(e){r.path("/customers")})["catch"](function(e){alert(JSON.stringify(e.data,null,4))})},e.cancel=function(){t.history.back()}}]),app.config(["$routeProvider",function(e){e.when("/customers",{controller:"customersController",templateUrl:"app/customer/customers.html",title:"Clienti"}).when("/customers/create",{controller:"customerController",templateUrl:"app/customer/customer.html",title:"Adauga client"}).when("/customers/:id",{controller:"customerController",templateUrl:"app/customer/customer.html",title:"Editeaza client",isEditMode:!0})}]),app.factory("customerService",["$http",function(e){var t={},o="/api/customers/";return t.create=function(t){return e.post(o,t)},t.getAll=function(){return e.get(o).then(function(e){return e.data})},t.getById=function(t){return e.get(o+encodeURIComponent(t)).then(function(e){return e.data})},t.update=function(t){return e.put(o,t)},t["delete"]=function(t){return e["delete"](o+encodeURIComponent(t))},t}]),app.controller("customersController",["$scope","$location","customerService",function(e,t,o){function n(){o.getAll().then(function(t){e.customers=t})["catch"](function(e){alert(JSON.stringify(e,null,4))})}e.customers=[],e.errors={},n(),e["delete"]=function(t){for(var n in e.customers)if(e.customers[n]._id===t._id)break;o["delete"](t._id).then(function(){e.customers.splice(n,1)})["catch"](function(t){e.errors=JSON.stringify(t.data,null,4),alert(e.errors)})},e.create=function(){t.path("/customers/create")},e.refresh=function(){n()}}]),app.controller("customerEmployeeController",["$scope","$window","$route","customerEmployeeService","$location",function(e,t,o,n,r){function i(){c()}function c(){n.getById(o.current.params.id).then(function(t){e.customerEmployee=t})["catch"](function(e){alert(JSON.stringify(e,null,4))})}e.isEditMode=o.current.isEditMode,e.isFocusOnName=e.isEditMode?!1:!0,e.customerEmployee={},e.isEditMode&&i(),e.create=function(t){e.submitted=!0,t.$valid&&n.create(e.customerEmployee).then(function(e){r.path("/customerEmployees")})["catch"](function(e){alert(JSON.stringify(e.data,null,4))})},e.update=function(t){e.submitted=!0,t.$valid&&n.update(e.customerEmployee).then(function(e){r.path("/customerEmployees")})["catch"](function(e){alert(JSON.stringify(e.data,null,4))})},e.cancel=function(){t.history.back()}}]),app.config(["$routeProvider",function(e){e.when("/customerEmployees",{controller:"customerEmployeesController",templateUrl:"app/customerEmployee/customerEmployees.html",title:"Angajati client"}).when("/customerEmployees/create",{controller:"customerEmployeeController",templateUrl:"app/customerEmployee/customerEmployee.html",title:"Adauga angajat"}).when("/customerEmployees/:id",{controller:"customerEmployeeController",templateUrl:"app/customerEmployee/customerEmployee.html",title:"Editeaza angajat",isEditMode:!0})}]),app.factory("customerEmployeeService",["$http",function(e){var t={},o="/api/customerEmployees/";return t.create=function(t){return e.post(o,t)},t.getAll=function(){return e.get(o).then(function(e){return e.data})},t.getById=function(t){return e.get(o+encodeURIComponent(t)).then(function(e){return e.data})},t.update=function(t){return e.put(o,t)},t["delete"]=function(t){return e["delete"](o+encodeURIComponent(t))},t}]),app.controller("customerEmployeesController",["$scope","$location","customerEmployeeService",function(e,t,o){function n(){o.getAll().then(function(t){e.customerEmployees=t})["catch"](function(e){alert(JSON.stringify(e,null,4))})}e.customerEmployees=[],e.errors={},n(),e["delete"]=function(t){for(var n in e.customerEmployees)if(e.customerEmployees[n]._id===t._id)break;o["delete"](t._id).then(function(){e.customerEmployees.splice(n,1)})["catch"](function(t){e.errors=JSON.stringify(t.data,null,4),alert(e.errors)})},e.create=function(){t.path("/customerEmployees/create")},e.refresh=function(){n()}}]),app.controller("dishController",["$scope","$window","$route","dishService","$location",function(e,t,o,n,r){function i(){c()}function c(){n.getById(o.current.params.id).then(function(t){e.dish=t})["catch"](function(e){alert(JSON.stringify(e,null,4))})}e.isEditMode=o.current.isEditMode,e.isFocusOnName=e.isEditMode?!1:!0,e.dish={},e.isEditMode&&i(),e.create=function(t){e.submitted=!0,t.$valid&&n.create(e.dish).then(function(e){r.path("/dishes")})["catch"](function(e){alert(JSON.stringify(e.data,null,4))})},e.update=function(t){e.submitted=!0,t.$valid&&n.update(e.dish).then(function(e){r.path("/dishes")})["catch"](function(e){alert(JSON.stringify(e.data,null,4))})},e.cancel=function(){t.history.back()}}]),app.config(["$routeProvider",function(e){e.when("/dishes",{controller:"dishesController",templateUrl:"app/dish/dishes.html",title:"Feluri de mancare"}).when("/dishes/create",{controller:"dishController",templateUrl:"app/dish/dish.html",title:"Adauga un fel de mancare"}).when("/dishes/:id",{controller:"dishController",templateUrl:"app/dish/dish.html",title:"Editeaza felul de mancare",isEditMode:!0})}]),app.factory("dishService",["$http",function(e){var t={},o="/api/dishes/";return t.create=function(t){return e.post(o,t)},t.getAll=function(){return e.get(o).then(function(e){return e.data})},t.getById=function(t){return e.get(o+encodeURIComponent(t)).then(function(e){return e.data})},t.update=function(t){return e.put(o,t)},t["delete"]=function(t){return e["delete"](o+encodeURIComponent(t))},t}]),app.controller("dishesController",["$scope","$location","dishService",function(e,t,o){function n(){o.getAll().then(function(t){e.dishes=t})["catch"](function(e){alert(JSON.stringify(e,null,4))})}e.dishes=[],e.errors={},n(),e["delete"]=function(t){for(var n in e.dishes)if(e.dishes[n]._id===t._id)break;o["delete"](t._id).then(function(){e.dishes.splice(n,1)})["catch"](function(t){e.errors=JSON.stringify(t.data,null,4),alert(e.errors)})},e.create=function(){t.path("/dishes/create")},e.refresh=function(){n()}}]),app.controller("homeController",["$scope",function(e){}]),app.config(["$routeProvider",function(e){e.when("/",{controller:"homeController",templateUrl:"app/home/home.html"})}]),app.controller("navbarController",["$scope","$location","navbarService","$window","Auth","$rootElement",function(e,t,o,n,r,i){function c(){var t=i.attr("ng-app"),r=t+"_buildInfo",c=angular.fromJson(n.sessionStorage.getItem(r));c?e.buildInfo=c:o.getAll().then(function(t){e.buildInfo=t,n.sessionStorage.setItem(r,angular.toJson(t))})["catch"](function(e){alert(JSON.stringify(e,null,4))})}e.menu=[{title:"Contact",link:"/contact"}],e.isCollapsed=!0,e.isLoggedIn=r.isLoggedIn,e.isAdmin=r.isAdmin,e.getCurrentUser=r.getCurrentUser,e.buildInfo={},c(),e.logout=function(){r.logout(),t.path("/login")},e.isActive=function(e){return e===t.path()}}]),app.factory("navbarService",["$http",function(e){var t={},o="/api/buildInfo/";return t.getAll=function(){return e.get(o).then(function(e){return e.data})},t}]),app.controller("changePasswordController",["$scope","User","Auth","$window",function(e,t,o,n){e.errors={},e.changePassword=function(t){e.submitted=!0,t.$valid&&o.changePassword(e.user.oldPassword,e.user.newPassword).then(function(){e.message="Parola a fost schimbata cu succes."})["catch"](function(){t.password.$setValidity("mongoose",!1),e.errors.other="Parola incorecta",e.message=""})},e.cancel=function(){n.history.back()}}]),app.controller("loginController",["$scope","Auth","$location","$window",function(e,t,o,n){e.user={},e.errors={},e.login=function(n){e.submitted=!0,n.$valid&&t.login({email:e.user.email,password:e.user.password}).then(function(){o.path("/")})["catch"](function(t){e.errors.other=t.message})},e.cancel=function(){n.history.back()}}]),app.controller("resetPasswordController",["$scope","User","Auth","$window",function(e,t,o,n){e.errors={},e.resetPassword=function(t){e.submitted=!0},e.cancel=function(){n.history.back()}}]),app.controller("signupController",["$scope","Auth","$location","$window",function(e,t,o,n){e.user={},e.errors={},e.register=function(n){e.submitted=!0,n.$valid&&t.createUser({name:e.user.name,email:e.user.email,password:e.user.password}).then(function(){o.path("/")})["catch"](function(t){t=t.data,e.errors={},angular.forEach(t.errors,function(t,o){n[o].$setValidity("mongoose",!1),e.errors[o]=t.message})})},e.loginOauth=function(e){n.location.href="/auth/"+e}}]),app.directive("match",function(){return{require:"ngModel",restrict:"A",scope:{match:"="},link:function(e,t,o,n){e.$watch(function(){return n.$pristine&&angular.isUndefined(n.$modelValue)||e.match===n.$modelValue},function(e){n.$setValidity("match",e)})}}});