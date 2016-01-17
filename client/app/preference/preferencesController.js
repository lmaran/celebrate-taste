/* global app */
'use strict';

app.controller('preferencesController', ['$scope', '$location', 'preferenceService', 'modalService', 'helperService',
    function ($scope, $location, preferenceService, modalService, helperService) {
        
    $scope.preferences = [];
    $scope.errors = {};
    $scope.nextDates=[]; 

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();
    
    $scope.selectDate = function(date){
        if(date !== 'Nu exista date'){
            $scope.selectedDate = date;
            
            console.log($scope.selectedDate);
            
            $location.search('date', date); // add property to url
            getPreferencesByDay($scope.selectedDate);
        }
    }     

    $scope.delete = function (item) {

        var modalOptions = {
            bodyDetails: item.name,           
        };
        
        modalService.confirm(modalOptions).then(function (result) {
        
            // get the index for selected item
            var i = 0;
            for (i in $scope.preferences) {
                if ($scope.preferences[i]._id === item._id) break;
            }

            preferenceService.delete(item._id).then(function () {
                $scope.preferences.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };

    $scope.create = function () {
        $location.path('/admin/preferences/create');
    }

    $scope.refresh = function () {
        init();
    };

    function init() {

        preferenceService.getNextDates().then(function (data) {
            $scope.nextDates = data;
            
            var searchObject = $location.search();
            if(searchObject.date)
                $scope.selectedDate = searchObject.date;
            else{
                if($scope.nextDates.length === 0)
                    $scope.nextDates.push('Nu exista date');
                else
                    $scope.selectedDate = $scope.nextDates[0];    
            }
            
            // get preferences for the selected day
            if($scope.selectedDate)
                getPreferencesByDay($scope.selectedDate);          
                                   
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });        
    }
    
    var getPreferencesByDay = function(dayStr){
        preferenceService.getByDate(dayStr).then(function (data) {
            $scope.preferences = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });          
    }
    
    $scope.dt = function (dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    }     

}]);