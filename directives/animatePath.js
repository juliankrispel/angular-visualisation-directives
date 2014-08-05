(function(){
"user strict";
angular.module('ngvis')
.directive('animatePath',
    function() {
		return {
			restrict: 'A',
			scope: {},
			link: function($scope, $elem, $attr){
				var path = $elem[0];
				var delay = parseInt($attr.animationDelay) || 1;
				setTimeout(function(){
					var length = path.getTotalLength();
					// Clear any previous transition
					path.style.transition = path.style.WebkitTransition = 'none';
					path.style.strokeDasharray = length + ' ' + length;
					path.style.strokeDashoffset = length;
					// Trigger a layout so styles are calculated & the browser
					// picks up the starting position before animating
					path.getBoundingClientRect();
					// Define our transition
					path.style.transition = path.style.WebkitTransition =
					  'stroke-dashoffset 3s ' + delay + 'ms ease-out';
					// Go!
					path.style.strokeDashoffset = '0';
				}, 1);
			}
		};
    }
);
})();
