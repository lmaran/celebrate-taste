/* global _ */
'use strict';

app.controller('customerEmployeesController', ['$scope', '$location', 'customerEmployeeService', 'modalService', 
    function ($scope, $location, customerEmployeeService, modalService) {
    
    $scope.customerEmployees = [];
    
    $scope.errors = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.menu = {}; 
    
    $scope.selectTeam = function(team){
        if(team === 'Toate echipele'){
            $scope.selectedTeam = 'Toate echipele';
            $location.search('team', null); // delete property from url
        } else {
            $scope.selectedTeam = team;
            $location.search('team', team); // add property to url
        }
    }    

    $scope.delete = function (item) {
        var modalOptions = {
            bodyDetails: item.name,           
        };
        modalService.confirm(modalOptions).then(function (result) {
            // get the index for selected item
            for (var i in $scope.customerEmployees) {
                if ($scope.customerEmployees[i]._id === item._id) break;
            }

            customerEmployeeService.delete(item._id).then(function () {
                $scope.customerEmployees.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });
        });
    };

    $scope.create = function () {
        $location.path('/admin/customerEmployees/create');
    }

    $scope.refresh = function () {
        init();
    };

    function init() {
        customerEmployeeService.getAll().then(function (data) {
            $scope.customerEmployees = data;
            
            $scope.teams = _.chain($scope.customerEmployees).map('team').uniq().sortBy().value();

            var searchObject = $location.search();
            if(searchObject.team)
                $scope.selectedTeam = searchObject.team;  
            else
                $scope.selectedTeam = 'Toate echipele';
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }
    
    // http://stackoverflow.com/a/31821283/2726725
    // use it in view with "| filter:myFilter""
    $scope.myFilter = function (item) {
        // default to no match
        var isMatch = false;

        if ($scope.search) {
            // split the input by space
            var parts = $scope.search.split(' ');

            // iterate each of the words that was entered
            parts.forEach(function (part) {
                // if the word is found in the post, a set the flag to return it.
                if (new RegExp(part, 'i').test(item.name)) {
                    isMatch = true;
                }
            });
        } else {
            // if nothing is entered, return all posts
            isMatch = true;
        }

        return isMatch;
    };

}]);