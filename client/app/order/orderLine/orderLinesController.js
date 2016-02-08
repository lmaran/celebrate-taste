/*global _*/
'use strict';

app.controller('orderLinesController', ['$scope', '$location', 'orderLineService', 'modalService', '$route',
    function ($scope, $location, orderLineService, modalService, $route) {

    $scope.orderId = $route.current.params.id;        
    $scope.orderLines = [];
    $scope.errors = {};
    $scope.obj = {};
    $scope.obj.onlyNoBadges = false;    
    
    $scope.selectOnlyNoBadges = function(){
        if($scope.obj.onlyNoBadges === false){
            $scope.obj.onlyNoBadges = true;
            $location.search('onlyNoBadges', null); // delete property from url
        } else {
            $scope.obj.onlyNoBadges = false;
            $location.search('onlyNoBadges', true); // add property to url
        }
    }    
    
    $scope.selectEatSeries = function(eatSeries){
        if(eatSeries === 'Toate seriile'){
            $scope.selectedEatSeries = 'Toate seriile';
            $location.search('eatSeries', null); // delete property from url
        } else {
            $scope.selectedEatSeries = eatSeries;
            $location.search('eatSeries', eatSeries); // add property to url
        }
    }
    
    $scope.selectPreference = function(preference){
        if(preference === 'Toate pref.'){
            $scope.selectPreference = 'Toate pref.';
            $location.search('preference', null); // delete property from url
        } else {
            $scope.selectPreference = preference;
            $location.search('preference', preference); // add property to url
        }
    }     
    
    $scope.preferences=['A', 'B', 'C', 'D'];    
    
    // $scope.order is defined in orderControler and available here as we are into a partial view

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.delete = function (item) {

        var modalOptions = {
            bodyDetails: item.name,           
        };
        
        modalService.confirm(modalOptions).then(function (result) {
        
            // get the index for selected item
            var i = 0;
            for (i in $scope.orderLines) {
                if ($scope.orderLines[i]._id === item._id) break;
            }

            orderLineService.delete(item._id).then(function () {
                $scope.orderLines.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };

    $scope.create = function () {
        $location.path('/admin/orders/' + $scope.orderId + '/orderLines/create');
        $location.search('orderDate', $scope.order.date); // add property to url
    }
    
    $scope.import = function () {
        $location.path('/admin/orders/' + $scope.orderId + '/orderLines/import');
        $location.search('orderDate', $scope.order.date); // add property to url
    }    

    $scope.refresh = function () {
        init();
    };

    function init() {
        orderLineService.getAll($scope.orderId).then(function (data) {
            $scope.orderLines = data;
            
            $scope.eatSeriesList = _.chain($scope.orderLines).map('eatSeries').uniq().sortBy().value();
            
            var searchObject = $location.search();
            if(searchObject.eatSeries)
                $scope.selectedEatSeries = searchObject.eatSeries;  
            else
                $scope.selectedEatSeries = 'Toate seriile';  
                
            if(searchObject.preference)
                $scope.selectedPreference = searchObject.preference;  
            else
                $scope.selectedPreference = 'Toate pref.'; 
                
            if(searchObject.onlyNoBadges)
                $scope.obj.onlyNoBadges = true;  
            else
                $scope.obj.onlyNoBadges = false;                                            
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }
    
    $scope.preferencesFilter = function(preference){
        if($scope.selectedPreference === 'Toate pref.'){
            return true;
        } else if ($scope.selectedPreference === 'A' || $scope.selectedPreference === 'B'){
            return preference.option1 === $scope.selectedPreference;
        } else if ($scope.selectedPreference === 'C' || $scope.selectedPreference === 'D'){
            return preference.option2 === $scope.selectedPreference;
        } else if($scope.selectedPreference === 'Fara pref.'){
            return !(preference.option1 && preference.option2);
        }
    }
    
    $scope.badgesFilter = function(orderLine){
        if($scope.obj.onlyNoBadges){
            return !orderLine.badgeCode;
        } else return true;
    }    

}]);