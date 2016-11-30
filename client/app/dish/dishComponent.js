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
                
                vm.errors.fileErrorMsg = validateImage(file, 10, 960, 640); // client-side validation
                if(vm.errors.fileErrorMsg){
                    return false;
                } 

                Upload.upload({
                    url: 'api/dishes/upload',
                    data: {
                        file: file
                    }
                }).then(function (resp) {
                    // file is uploaded successfully
                    vm.dish.image = resp.data;
                    vm.errors.fileErrorMsg = ""; // reset errors
                }, function (resp) {
                    // handle error
                    vm.errors.fileErrorMsg = resp.data.msg; // server-side validation
                }, function (evt) {
                    // progress notify
                    // var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    // console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);

                    // Math.min is to fix IE which reports 200% sometimes
                    //file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));                    
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
    
    function validateImage(file, maxSizeInMB, maxWidth, maxHeight){
        // if you change this validations, change also the corresponding rules in the server-side
        
        // properties like '$ngfWidth', '$ngfHeight' or '$ngfBlobUrl' (for image preview in browser) ...
        // ...requires 'ngf-min-width' attribute (or similar) in html part
        // ...or 'Upload.imageDimensions()' in js part

        if(file.size > maxSizeInMB * 1024 * 1024){
            return "Sunt acceptate doar poze cu dimensiunea de maximum " + maxSizeInMB + " MB.";
        }

        if(file.type !== "image/jpeg"){
            return "Sunt acceptate doar poze in format '.jpg'.";
        }

        if(file.$ngfWidth < file.$ngfHeight){
            return "Sunt acceptate doar poze in format 'landscape' (latime > inaltime).";
        }

        if(file.$ngfWidth < maxWidth){
            return "Sunt acceptate doar poze cu latimea de minimum " + maxWidth + " px.";
        }

        if(file.$ngfHeight < maxHeight){
            return "Sunt acceptate doar poze cu inaltimea de minimum " + maxHeight + " px.";
        }    

        return ""; 
    }

})();