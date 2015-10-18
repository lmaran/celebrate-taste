// http://stackoverflow.com/a/17739731/2726725
'use strict';

app.directive('lmFocus', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            if (attrs.lmFocus === 'true' || attrs.lmFocus === '') { //set focus without using a scope variable (Ex: 'focus="true"' or simply 'focus')
                $timeout(function () {
                    element[0].focus();
                }, 0);
            } else {
                scope.$watch(attrs.lmFocus, function (newValue, oldValue) {
                    $timeout(function () {
                        if (newValue) { element[0].focus(); }
                    }, 0);
                });
                element.bind('blur', function (e) {
                    $timeout(function () {
                        scope.$apply(attrs.lmFocus + '=false');
                    }, 0);
                });
                element.bind('focus', function (e) {
                    $timeout(function () {
                        scope.$apply(attrs.lmFocus + '=true');
                    }, 0);
                })
            }
        }
    }
}]);


