(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("dishList",{
        templateUrl:"app/dish/dishList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "dishService", "modalService", "toastr", controller]     
    });
       
    function controller($location, $window, dishService, modalService, toastr){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Feluri de mancare";            
            vm.dishes = [];
            vm.errors = {};    
            
            getDishes();
        };
        
        
        //
        // public methods
        //       
        vm.create = function () {
            $location.path('/admin/dishes/create');
        }
        
        vm.delete = function (dish) {
            var modalOptions = {
                bodyDetails: dish.name,           
            };
            modalService.confirm(modalOptions).then(function (result) {
                dishService.delete(dish._id).then(function () {
                    _.remove(vm.dishes, {_id: dish._id});                   
                })
                .catch(function (err) {
                    vm.errors = JSON.stringify(err.data, null, 4);
                    alert(vm.errors);
                });
            });
        };         

        vm.refresh = function () {
            getDishes();
        };

        vm.goBack = function(){ 
            $window.history.back();
        } 
        
        vm.showModal = function (dish) {
            var modalOptions = {
                imageUrl: dish.image.large,           
            };
            
            modalService.showImage(modalOptions).then(function (result) {
            });
        };        
        
                        
        //
        // private methods
        //
        function getDishes(){
            dishService.getAll().then(function (data) {               
                vm.dishes = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }        
    }
    
})();