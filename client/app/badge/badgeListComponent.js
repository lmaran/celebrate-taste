(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("badgeList",{
        templateUrl:"app/badge/badgeList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "badgeService", "Upload", "modalService", controller]     
    });
       
    function controller($location, $window, badgeService, Upload, modalService){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Carduri";
            vm.badges = [];
            vm.errors = {};    
            
            getCustomerEmpoyees();
        };
        
        
        //
        // public methods
        //       
        vm.create = function () {
            $location.path('/admin/badges/create');
        }
        
        vm.delete = function (badge) {
            var modalOptions = {
                bodyDetails: badge.name,           
            };
            modalService.confirm(modalOptions).then(function (result) {
                badgeService.delete(badge._id).then(function () {
                     _.remove(vm.badges, {_id: badge._id});
                })
                .catch(function (err) {
                    vm.errors = JSON.stringify(err.data, null, 4);
                    alert(vm.errors);
                });
            });
        };

        vm.upload = function (file) {
            if(file){ // otherwise, a duplicate request is sent if you try to modify an image two (or more) times
                
                vm.errors.fileErrorMsg = validateFile(file, 5); // client-side validation
                if(vm.errors.fileErrorMsg){
                    return false;
                } 
                vm.inProgress = true;
                vm.importStatusMsg = "";

                Upload.upload({
                    url: 'api/badges/upload',
                    data: {
                        file: file
                    }
                }).then(function (resp) {
                    // file is uploaded successfully
                    //vm.dish.image = resp.data;
                    vm.errors.fileErrorMsg = ""; // reset errors
                    vm.inProgress = false;
                    // alert(resp.data.importedCards + " carduri au fost importate cu succes.");                    
                    vm.importStatusMsg = resp.data.importedCards + " carduri au fost importate cu succes.";
                }, function (resp) {
                    // handle error
                    vm.errors.fileErrorMsg = resp.data.msg; // server-side validation
                    vm.inProgress = false;
                }, function (evt) {
                    // progress notify
                    // Math.min is to fix IE which reports 200% sometimes
                    vm.progressPercentage = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));                
                });
            }
        };         

        vm.filterBySearch = function (item) {
            var isMatch = false;
            if (vm.search) {
                // search by employeeName or badge
                if (new RegExp(vm.search, 'i').test(item.name) || new RegExp(vm.search, 'i').test(item.badgeCode)) {
                    isMatch = true;
                }
            } else {
                // if nothing is entered, return all posts
                isMatch = true;
            }
            return isMatch;
        };          

        vm.refresh = function () {
            getCustomerEmpoyees();
        };

        vm.goBack = function(){ 
            $window.history.back();
        } 
        
                        
        //
        // private methods
        //
        function getCustomerEmpoyees(){
            badgeService.getAll().then(function (data) {
                vm.badges = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }

        function validateFile(file, maxSizeInMB){
            if(file.size > maxSizeInMB * 1024 * 1024){
                return "Sunt acceptate doar fisiere cu dimensiunea de maximum " + maxSizeInMB + " MB.";
            }

            if(file.type !== "application/vnd.ms-excel" && // xls
                file.type !=="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ){ //xlsx
                return "Sunt acceptate doar fisiere Excel.";
            }

            return ""; 
        }

    }
    
})();