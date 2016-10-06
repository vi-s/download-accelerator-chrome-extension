// var scripts = document.getElementsByTagName("script")
// var currentScriptPath = scripts[scripts.length-1].src;
// currentScriptPath.replace('directive.js', 'template.html')

angular.module('DownloadAccelerator').directive('downloadDisplay', function() {
	  return {
	  	// I have used ng-include instead of template or templateUrl
	    // template: '<div ng-bind="test3"></div>',
	    controller: function($scope) {
	      $scope.test3 = "HI FROM DIRECTIVE 2222";
	    }
	  }
});

console.log('DIRECTIVE LOADED');