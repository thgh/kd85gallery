'use strict';

angular.module('wim', [])
.directive('gallery', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: { s:'@s' },
		template:
			'<div class="hide" ng-transclude></div>' +
			'<p class="gallery-lg"><a href="{{now.src}}"><img ng-src="{{now.src}}" /></a></p>'+
			'<p class="gallery-sm"><a href ng-click="set(i)" ng-repeat="i in imgs"><img ng-src="{{i.thumb}}" ng-class="{s:now==i}" /></a></p>',
		link: function(scope, element, attrs) {
			scope.imgs=[];
			angular.forEach(element.children()[0].textContent.split(/[\s,]+/), function(v,k) {
				if(v){
					var temp=v.split('/');
					scope.imgs.push({
						src:"upload/"+v,
						thumb:"thumbs/"+temp[temp.length-1]
					});
				}
			});
			scope.now = scope.imgs[0];
    	scope.set = function(i) { scope.now=i;}
		}
	}
});