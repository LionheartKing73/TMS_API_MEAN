(function() {
  'use strict';

  angular
    .module('sticky')
    .directive('sticky', Directive);

  // Directive.$inject = ['dependency1'];
  function Directive() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
        // compile: function compile(el, attr, transclude){
        //   return { post: link };
        // },
        restrict: 'A',
        //priority: 400,
        scope: {
          isSticky: '@'
        },
        link: link
    };
    
    
    function link(scope, element, attrs) {
     
      setTimeout(function(){
        
        if ( angular.isDefined(scope.isSticky) && 
            scope.isSticky === "false") { 
              return;
        }

		if(element.context.clientWidth < 218){
			return ;
		}
		var myEl = angular.element(element[0].querySelector('.sticky_title'));
		
        myEl.css({
          "position": "sticky",
          "background-clip": "padding-box"
        });
        
        if ( attrs.stickyLeft ) {
          myEl.css({
            "left": attrs.stickyLeft + "px"
          });
        }
        
        if (attrs.stickyRight) {
          myEl.css({
            "right": attrs.stickyRight + "px"
          });
        }
        if (attrs.stickyTop) {
          myEl.css({
            "top": attrs.stickyTop + "px"
          });
        }
        if (attrs.stickyBottom) {
          myEl.css({
            "left": attrs.stickyBottom + "px"
          });
        }
      }, 100);

    }

    return directive;
  }
})();