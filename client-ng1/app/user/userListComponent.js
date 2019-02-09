(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("userList",{
        templateUrl:"app/user/userList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "userService", "modalService", "toastr", controller]     
    });
       
    function controller($location, $window, userService, modalService, toastr){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Utilizatori";
            vm.users = [];
            vm.errors = {};    
            
            getUsers();
        };
        
        
        //
        // public methods
        //       
        vm.create = function () {
            $location.path('/admin/users/create');
        }
        
        vm.delete = function (user) {
            var modalOptions = {
                bodyDetails: user.name,           
            };
            modalService.confirm(modalOptions).then(function (result) {
                userService.delete(user._id).then(function () {
                    _.remove(vm.users, {_id: user._id});
                    
                    if(userService.getCurrentUser().name === user.name){
                        userService.logout();
                        //$window.location.href = '/'; //server-side home page             
                    }                    
                })
                .catch(function (err) {
                    vm.errors = JSON.stringify(err.data, null, 4);
                    alert(vm.errors);
                });
            }, function() {
                // Cancel button
            });  
        };

        vm.filterBySearch = function (item) {
            var isMatch = false;
            if (vm.search) {
            // search by user name or email
            if (new RegExp(vm.search, 'i').test(item.name) || new RegExp(vm.search, 'i').test(item.email)) {
                    isMatch = true;
                }
            } else {
                // if nothing is entered, return all posts
                isMatch = true;
            }
            return isMatch;
        };          

        vm.refresh = function () {
            getUsers();
        };

        vm.goBack = function(){ 
            $window.history.back();
        } 
        
                        
        //
        // private methods
        //
        function getUsers(){
            userService.getAll().then(function (data) {
                data.forEach(function(user){
                    if(user.activationToken){
                        user.status = 'asteapta activare';
                    } else{
                        user.status = 'activ';
                    }
                });                
                vm.users = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }        
    }
    
})();