(function(){
    'use strict';

    angular.module('app')
    .controller('demoController', ['$scope', 'demoService', function ($scope, demoService) {

        demoService.get().then(function(result){
            $scope.itemValue=result;
            $scope.itemValue.local = 'some local data234567';
        });   
    
    }]);
    
})(); 
