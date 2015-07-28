(function(){
    'use strict';

    angular.module('app')
    .directive('demoDirective', [function() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) { }
        };
    }]);
    
})();