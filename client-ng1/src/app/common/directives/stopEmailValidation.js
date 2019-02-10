'use strict';

// http://stackoverflow.com/a/27952712/2726725
app.directive('stopEmailValidation', function() {
  var EMAIL_REGEXP = /./; // any string

  return {
    require: 'ngModel',
    restrict: '',
    priority: 2,
    link: function(scope, elm, attrs, ctrl) {
      if (ctrl && ctrl.$validators.email) {
        // this will overwrite the default Angular email validator
        ctrl.$validators.email = function(modelValue) {
          return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
        }
      }
    }
  }
});