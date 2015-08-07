'use strict';

app.controller('navbarController', ['$scope', '$location', 'Auth', function ($scope, $location, Auth) {
           
    $scope.menu = [{
        'title': 'Page 1',
        'link': '/page1'
    }, {
        'title': 'Customers',
        'link': '/customers'
    }, {        
        'title': 'Contact',
        'link': '/contact'
    }];  
        
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
        Auth.logout();
        $location.path('/login');
    };             

    // http://stackoverflow.com/a/18562339
    $scope.isActive = function (route) {
        return route === $location.path();
    };

}]);