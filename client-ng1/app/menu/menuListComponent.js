(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("menuList",{
        templateUrl:"app/menu/menuList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "menuService", "modalService", "helperService", "toastr", "$uibModal", controller]     
    });
       
    function controller($location, $window, menuService, modalService, helperService, toastr, $uibModal){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Meniuri";            
            vm.menus = [];
            vm.errors = {};    
            
            getMenus();
        };
        
        
        //
        // public methods
        //       
        vm.create = function (dateAsString) {
            var menu={ menuDate:dateAsString };
            menuService.create(menu)
                .then(function (data) {
                    vm.refresh();
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        };  
        
        vm.delete = function (menu) {
            var modalOptions = {
                bodyDetails: 'Meniul de ' + vm.friendlyDate(menu.menuDate)           
            };
            modalService.confirm(modalOptions).then(function (result) {
                menuService.delete(menu._id).then(function () {
                    _.remove(vm.menus, {_id: menu._id});                 
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
            // search by menu name or email
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
            getMenus();
        };

        vm.goBack = function(){ 
            $window.history.back();
        } 
        
        vm.friendlyDate = function (dateAsString) { // yyyy-mm-dd
            return helperService.getStringFromString(dateAsString);
        }
        
        vm.deleteDishFromMenu = function (dish, menu) {
            var modalOptions = {
                bodyDetails: dish.name,
            };

            modalService.confirm(modalOptions).then(function (result) {
                _.remove(menu.dishes, {_id: dish._id});

                menuService.update(menu)
                    .then(function (data) {
                        vm.refresh();
                    })
                    .catch(function (err) {
                        alert(JSON.stringify(err.data, null, 4));
                    });

            });
        };         

        vm.openCreateMenu = function () {
            var lastMenu = _.chain(vm.menus)
                .sortBy('menuDate')
                .last()
                .value();
                
            var lastMenuDate = (lastMenu && lastMenu.menuDate) || helperService.getStringFromDate(new Date());

            var modalInstance = $uibModal.open({
                animation:false,
                templateUrl: 'app/menu/createMenuTpl.html',
                controller: 'createMenuTplController',
                resolve: {
                    dataToModal: function () {
                        return lastMenuDate;
                    }
                }
            });

            modalInstance.result.then(function (dataFromModal) { // js date object
                var dateAsString = helperService.getStringFromDate(dataFromModal); // "yyyy-mm-dd" 
                vm.create(dateAsString);
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });       
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
        function getMenus(){
            menuService.getActiveMenus().then(function (data) {               
                vm.menus = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }        
    }
    
})();