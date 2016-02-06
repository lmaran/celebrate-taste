/*global app*/
'use strict';

app.controller('customerEmployeeController', ['$scope', '$route', 'customerEmployeeService', '$location', 'teamService', '$q', 'helperValidator', 
    function ($scope, $route, customerEmployeeService, $location, teamService, $q, helperValidator) {
       
    //var promiseToGetTeams;
    var promiseToGetCustomerEmployee;        
    $scope.isEditMode = $route.current.isEditMode;
    $scope.isFocusOnName = $scope.isEditMode ? false : true;
    
    $scope.isActiveOptions = [{id: true, name: 'Da'},{id: false, name: 'Nu'}];
    $scope.customerEmployee = {};
    //$scope.team = [];
    $scope.errors = {};

    //getTeams();
   
    if ($scope.isEditMode) {  
        /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined     
        init(); 
    }

    function init() {
        getCustomerEmployee();
            
        // // init team in dropdown
        // $q.all([promiseToGetCustomerEmployee, promiseToGetTeams])
        //     .then(function (result) {
        //         $scope.selectedTeam = _.find($scope.teams, {name : $scope.customerEmployee.team});
        //     }, function (reason) {
        //         alert('Failed: ' + reason);
        //     });            
    } 

    function getCustomerEmployee() {
        promiseToGetCustomerEmployee = customerEmployeeService.getById($route.current.params.id).then(function (data) {
            $scope.customerEmployee = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    }
    
    // function getTeams() {
    //     promiseToGetTeams = teamService.getAll().then(function (data) {
    //         $scope.teams = data;
    //     })
    //     .catch(function (err) {
    //         alert(JSON.stringify(err, null, 4));
    //     });
    // }         

    $scope.create = function (form) {
        
        // if($scope.selectedTeam){
        //     $scope.customerEmployee.team = $scope.selectedTeam.name;
        // }        

        validateForm($scope, form);
        if (form.$invalid) return false;
        
        customerEmployeeService.create($scope.customerEmployee)
            .then(function (data) {
                //$location.path('/admin/customerEmployees');
                $scope.goBack(); // it comes from rootScope
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
        
        // if($scope.selectedTeam){
        //     $scope.customerEmployee.team = $scope.selectedTeam.name;
        // }         

        validateForm($scope, form);
        if (form.$invalid) return false;
            
        customerEmployeeService.update($scope.customerEmployee)
            .then(function (data) {
                //$location.path('/admin/customerEmployees');
                $scope.goBack(); // it comes from rootScope
            })
            .catch(function (err) {
                if(err.data.errors){                   
                    helperValidator.updateValidity($scope, form, err.data.errors);
                } else{
                    alert(JSON.stringify(err.data, null, 4)); 
                }
            });
    };
    
    function validateForm($scope, form){ 
        var entity = 'customerEmployee'; 
        helperValidator.setAllFildsAsValid(form);
        
        // fields
        helperValidator.required50($scope, form, entity, 'name');
        helperValidator.optionalEmail($scope, form, entity, 'email');
    }     

}]);