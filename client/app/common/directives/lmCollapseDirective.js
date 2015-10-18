  /*
    versiunea originala: https://github.com/angular-ui/bootstrap/blob/master/src/collapse/collapse.js
    am modificat-o pt. ca:
    1. functiona OK doar daca instalam "ngAnimate" (angular-animate.js)
    2. nu-mi permitea sa dezactivez animatia (nu vreau animatie la expand/collapse navbar) 
    
    OBS: daca vrei animatie si instalezi "ngAnimate" at. varianta originala e OK (uibCollapse)
  */
  'use strict';
  
  app.directive('lmCollapse', [function () {
      return {
          link: function (scope, element, attrs) {

              function expandDone() {
                  element.removeClass('collapsing')
                      .addClass('collapse in')
                      .css({ height: 'auto' });
              }

              function collapseDone() {
                  element.css({ height: '0' }); // Required so that collapse works when animation is disabled
                  element.removeClass('collapsing')
                      .addClass('collapse');
              }

              scope.$watch(attrs.lmCollapse, function (shouldCollapse) {
                  if (shouldCollapse) {
                      collapseDone();
                  } else {
                      expandDone();
                  }
              });
          }
      };
  }]);