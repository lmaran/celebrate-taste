(function() {
    /* global _ */
    "use strict";
    
    var module = angular.module("celebrate-taste");
    
    module.component("reviewList",{
        templateUrl:"app/review/reviewList.html",
        controllerAs:"vm",
        controller:["$location", "$window", "reviewService", "modalService", controller]     
    });
       
    function controller($location, $window, reviewService, modalService){
        var vm = this;
        
        //
        // lifecycle hooks (chronological)
        //        
        vm.$onInit = function(){
            vm.pageTitle = "Feedback clienti";
            vm.reviews = [];
            vm.errors = {};    
            
            getReviews();
        };
        
        
        //
        // public methods
        //       
        vm.create = function () {
            $location.path('/admin/reviews/create');
        }
        
        vm.delete = function (review) {
            var modalOptions = {
                bodyDetails: review.name,           
            };
            modalService.confirm(modalOptions).then(function (result) {
                reviewService.delete(review._id).then(function () {
                     _.remove(vm.reviews, {_id: review._id});
                })
                .catch(function (err) {
                    vm.errors = JSON.stringify(err.data, null, 4);
                    alert(vm.errors);
                });
            });
        };

        vm.filterBySearch = function (item) {
            var isMatch = false;
            if (vm.search) {
                // search by employeeName or badge
                if (new RegExp(vm.search, 'i').test(item.dishName) || new RegExp(vm.search, 'i').test(item.createdBy)) {
                    isMatch = true;
                }
            } else {
                // if nothing is entered, return all posts
                isMatch = true;
            }
            return isMatch;
        };          

        vm.refresh = function () {
            getReviews();
        };

        vm.goBack = function(){ 
            $window.history.back();
        } 
        
                        
        //
        // private methods
        //
        function getReviews(){
            reviewService.getAll().then(function (data) {
                vm.reviews = data;
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        }        
    }
    
})();