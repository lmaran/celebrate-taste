/* global angular */
'use strict';

app.controller('navbarController', ['$scope', '$location', 'navbarService', '$window', 'Auth', '$rootElement', 
    function ($scope, $location, navbarService,$window, Auth, $rootElement) {
               
    $scope.menu = [{
    //     'title': 'Page 1',
    //     'link': '/page1'
    // }, {
    //     'title': 'Customers',
    //     'link': '/customers'
    // }, {        
        'title': 'Contact',
        'link': '/contact'
    }];  
        
    $scope.isCollapsed = true;   
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.buildInfo = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.logout = function() {
        Auth.logout();
        $location.path('/login');
    };             

    // http://stackoverflow.com/a/18562339
    $scope.isActive = function (route) {
        return route === $location.path();
    };

    function init() {
        var appName = $rootElement.attr('ng-app'); // http://stackoverflow.com/a/17503179
        var buildInfoKey = appName + '_buildInfo';
        
        // cache buildInfo in Session Storage
        var buildInfo = angular.fromJson($window.sessionStorage.getItem(buildInfoKey));
        if(buildInfo){
            $scope.buildInfo = buildInfo;
        }
        else{
            navbarService.getAll().then(function (data) {
                $scope.buildInfo = data;
                $window.sessionStorage.setItem(buildInfoKey, angular.toJson(data));
            })
            .catch(function (err) {
                alert(JSON.stringify(err, null, 4));
            });
        }
    }

}]);