http://stackoverflow.com/a/17739731/2726725

app.directive('focus', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            if (attrs.focus == "true" || attrs.focus == "") { //set focus without using a scope variable (Ex: 'focus="true"' or simply 'focus')
                $timeout(function () {
                    element[0].focus();
                }, 0);
            } else {
                scope.$watch(attrs.focus, function (newValue, oldValue) {
                    $timeout(function () {
                        if (newValue) { element[0].focus(); }
                    }, 0);
                });
                element.bind("blur", function (e) {
                    $timeout(function () {
                        scope.$apply(attrs.focus + "=false");
                    }, 0);
                });
                element.bind("focus", function (e) {
                    $timeout(function () {
                        scope.$apply(attrs.focus + "=true");
                    }, 0);
                })
            }
        }


        //link: function (scope, element, attrs) {
        //    scope.$watch(attrs.focus, function (_focusVal) {
        //        $timeout(function() {
        //            _focusVal ? element[0].focus() :
        //                element[0].blur();
        //        });
        //    });
        //}

    }
}]);


