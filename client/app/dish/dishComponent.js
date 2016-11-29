(function() {
    "use strict";
    
    var module = angular.module("celebrate-taste");
    var id;
    
    module.component("dish",{
        templateUrl:"app/dish/dish.html",
        controllerAs:"vm",
        controller:["$route", "$window", "dishService", "helperValidator", "toastr", "Upload", controller]       
    });
       
    function controller($route, $window, dishService, helperValidator, toastr, Upload){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function(){
            vm.dish = {};
            vm.errors = {};            
            vm.isFocusOnName = vm.isEditMode ? false : true;    
            vm.isActiveOptions = [{id: true, name: 'Da'},{id: false, name: 'Nu'}];
        };
        
        vm.$routerOnActivate = function (next, previous) {
            id = next.params.id;
            vm.isEditMode = next.routeData.data.action === "edit";
            
            if (vm.isEditMode) {  
                vm.pageTitle = "Editeaza felul de mancare";
                getDish();                 
            } else {
                vm.pageTitle = "Adauga un fel de mancare"; 
            } 
        };        
        
        
        //
        // public methods
        //
        vm.create = function (form) {
            validateForm(vm, form);
            if (form.$invalid) return false;
            
            dishService.create(vm.dish)
                .then(function (data) {
                    vm.goBack(); // it comes from rootScope
                })
                .catch(function (err) {
                    if(err.data.errors){                   
                        helperValidator.updateValidity(vm, form, err.data.errors);
                    } else{
                        alert(JSON.stringify(err.data, null, 4)); 
                    }
                }) 
        };        
            
        vm.update = function (form) {                  
            validateForm(vm, form);
            if (form.$invalid) return false;
                
            dishService.update(vm.dish)
                .then(function (data) {
                    vm.goBack();
                })
                .catch(function (err) {
                    if(err.data.errors){                   
                        helperValidator.updateValidity(vm, form, err.data.errors);
                    } else{
                        alert(JSON.stringify(err.data, null, 4)); 
                    }
                });
        };
        
        vm.goBack = function(){ 
            $window.history.back();
        }   
        
        // upload on file select or drop
        // https://github.com/danialfarid/ng-file-upload#-usage
        vm.upload = function (file) {
            if(file){ // otherwise, a duplicate request is sent if you try to modify an image two (or more) times
                Upload.upload({
                    url: 'api/dishes/upload',
                    data: {
                        file: file
                    }
                }).then(function (resp) {
                    // file is uploaded successfully
                    vm.dish.image = resp.data;
                    vm.errors.image = ""; // reset errors
                }, function (resp) {
                    // handle error
                    // console.log('Error status: ' + resp.status);
                    vm.errors.image = resp.data.msg;
                }, function (evt) {
                    // progress notify
                    // var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    // console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            }
        };                

        vm.removeImage = function(){
            delete vm.dish.image;
        }
        
        //
        // private methods
        //        
        function validateForm(vm, form){ 
            var entity = 'dish'; 
            helperValidator.setAllFildsAsValid(form);
            
            // fields
            helperValidator.required50(vm, form, entity, 'name');
            helperValidator.required50(vm, form, entity, 'category');
        } 
        
        function getDish() {
            dishService.getById(id).then(function (data) {
                vm.dish = data;
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });
        }               

    }
    
})();