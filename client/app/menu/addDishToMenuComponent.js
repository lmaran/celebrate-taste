(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    var menuId;
    
    module.component("addDishToMenu",{
        templateUrl:"app/menu/addDishToMenu.html",
        controllerAs:"vm",
        controller:["$window", "menuService", "dishService", "helperValidator", "helperService", "toastr", "modalService", controller]       
    });
       
    function controller($window, menuService, dishService, helperValidator, helperService, toastr, modalService){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.pageTitle = "Editeaza produsul din meniu";
            vm.menu = {};
            vm.categories = [
                {value:0, name:'Toate felurile'},
                {value:1, name:'Supa'},
                {value:2, name:'Felul 2'},
                {value:3, name:'Salata'},
                {value:4, name:'Desert'}
            ];
            
            vm.selectedCategory =  vm.categories[0];  
            vm.isFastingSelected = false;       
            
            vm.selectCategory = function(category){
                vm.selectedCategory = category;
            }

            vm.dishes = [];   
            

            
            vm.status = {isopen: false};          
        };
        
        vm.$routerOnActivate = function (next, previous) {
            menuId = next.params.id;
            loadDishesData()
            loadMenuData(); 
        };        
        
        
        //
        // public methods
        //
        vm.addToMenu = function (dish) {
            // search in the same caterory as dish
            // var dishesInCategory = _.filter(vm.menu.dishes, {category: dish.category})
            //console.log(dishesInCategory);
            // if(dishesInCategory && dishesInCategory.length >= 2){
            //     alert('Exista deja doua mancaruri din felul ' + dish.category + '.');
            //     return false;
            // }
            
            var dishClone = {};
            angular.copy(dish, dishClone); // deep copy
            
            //dishClone._id = helperService.makeId(6); // ex: "spr9na" (the original _id could not be unique in this menu)
            if(dish.category === '1' || dish.category === '2'){
                // dishClone.option = getOptionChar(dishesInCategory, dish);
                dishClone.option = getOptionChar2(vm.menu.dishes, dish);
            }
            if(vm.menu.dishes === undefined) vm.menu.dishes = [];
            vm.menu.dishes.push(dishClone);

            menuService.update(vm.menu)
                .then(function (data) {
                    dish.isAddedTmp = true;
                    loadMenuData(); 
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        };
        
        vm.removeFromMenu = function (dish) {   
            _.remove(vm.menu.dishes, function(item){
                return item._id === dish._id;
            });

            menuService.update(vm.menu)
                .then(function (data) {
                    delete dish.isAddedTmp;
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        };    
        
        vm.goBack = function(){ 
            $window.history.back();
        }   
        
        vm.refresh = function(){
            loadDishesData()
            loadMenuData(); 
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
        function loadMenuData() {
            menuService.getById(menuId).then(function (data) {
                vm.menu = data;
                vm.roMenuDate = helperService.getStringFromString(data.menuDate);
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });        
        }
        
        function loadDishesData() {
            dishService.getAll().then(function (data) {
                vm.dishes = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            });       
        }
        
        // function getOptionChar(dishesInCategory, dish){       
        //     var firstChar = 'A';
        //     if(dish.category === '2') firstChar = 'C';

        //     if(dishesInCategory === undefined || dishesInCategory.length === 0)
        //         return firstChar;
        //     else{ // dishesInCategory.length == 1
        //         var existingDish = dishesInCategory[0];
        //         if(existingDish.option === firstChar)
        //             return String.fromCharCode(firstChar.charCodeAt(0) + 1);
        //         else
        //             return String.fromCharCode(existingDish.option.charCodeAt(0) - 1);                
        //     }       
        // } 

        function getOptionChar2(dishes, dish){       
            var firstChar = 'A';

            if(dishes === undefined || dishes.length === 0)
                return firstChar;
            else {
                var lastDish = dishes[dishes.length -1];
                // if(lastDish.option === firstChar)
                //     return String.fromCharCode(firstChar.charCodeAt(0) + 1);
                // else
                    return String.fromCharCode(lastDish.option.charCodeAt(0) + 1);                
            }       
        }                                       

    }
    
})();