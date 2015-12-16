/* global _ */
/*global app*/
'use strict';

app.controller('customerEmployeeController', ['$scope', '$window', '$route', 'customerEmployeeService', '$location', 'badgeService', 'teamService', '$q', 'helperValidator', 
    function ($scope, $window, $route, customerEmployeeService, $location, badgeService, teamService, $q, helperValidator) {
       
    var promiseToGetBadges, promiseToGetTeams, promiseToGetCustomerEmployee;        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    $scope.selectedBadge = {};
    
    $scope.isActiveOptions = [{id: true, name: 'Da'},{id: false, name: 'Nu'}];
    $scope.customerEmployee = {};
    $scope.badges = [];
    $scope.team = [];
    $scope.errors = {};

    getBadges();
    getTeams();
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getCustomerEmployee();
        
        // init badge in dropdown
        $q.all([promiseToGetCustomerEmployee, promiseToGetBadges])
            .then(function (result) {
                $scope.selectedBadge = _.find($scope.badges, {code : $scope.customerEmployee.badgeCode});
            }, function (reason) {
                alert('Failed: ' + reason);
            });
            
        // init badge in dropdown
        $q.all([promiseToGetCustomerEmployee, promiseToGetTeams])
            .then(function (result) {
                $scope.selectedTeam = _.find($scope.teams, {name : $scope.customerEmployee.team});
            }, function (reason) {
                alert('Failed: ' + reason);
            });            
    } 

    function getCustomerEmployee() {
        promiseToGetCustomerEmployee = customerEmployeeService.getById($route.current.params.id).then(function (data) {
            $scope.customerEmployee = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }
    
    function getBadges() {
        promiseToGetBadges = badgeService.getAll().then(function (data) {
            $scope.badges = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    } 
    
    function getTeams() {
        promiseToGetTeams = teamService.getAll().then(function (data) {
            $scope.teams = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }         

    $scope.create = function (form) {
        
        if($scope.selectedBadge){
            $scope.customerEmployee.badgeCode = $scope.selectedBadge.code;
            $scope.customerEmployee.badgeName = $scope.selectedBadge.name;
        }
        
        if($scope.selectedTeam){
            $scope.customerEmployee.team = $scope.selectedTeam.name;
        }        

        validateForm($scope, form);
        if (form.$invalid) return false;
        
        customerEmployeeService.create($scope.customerEmployee)
            .then(function (data) {
                //$location.path('/admin/customerEmployees');
                $window.history.back();
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            }) 
    };

    $scope.update = function (form) {
        
        if($scope.selectedBadge){
            $scope.customerEmployee.badgeCode = $scope.selectedBadge.code;
            $scope.customerEmployee.badgeName = $scope.selectedBadge.name;
        }
        
        if($scope.selectedTeam){
            $scope.customerEmployee.team = $scope.selectedTeam.name;
        }         

        validateForm($scope, form);
        if (form.$invalid) return false;
            
        customerEmployeeService.update($scope.customerEmployee)
            .then(function (data) {
                //$location.path('/admin/customerEmployees');
                $window.history.back();
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            });
    };

    $scope.cancel = function () {
        $window.history.back();
    }
    
    function validateForm($scope, form){ 
        var entity = 'customerEmployee'; 
        helperValidator.setAllFildsAsValid(form);
        
        // fields
        helperValidator.required50($scope, form, entity, 'name');
        helperValidator.optionalEmail($scope, form, entity, 'email');
    }     

}]);