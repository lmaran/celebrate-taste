'use strict';

app.controller('navbarController', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
        
        $scope.isCollapsed = true;
                
        $scope.menu = [{
                'title': 'Page 1',
                'link': '/page1'
            }, {
                'title': 'Contact',
                'link': '/contact'
            }];       

        // http://stackoverflow.com/a/18562339
        $scope.isActive = function (route) {
            return route === $location.path();
        };

    }]);