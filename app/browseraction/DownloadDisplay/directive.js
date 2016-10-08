// var scripts = document.getElementsByTagName("script")
// var currentScriptPath = scripts[scripts.length-1].src;
// currentScriptPath.replace('directive.js', 'template.html')

angular.module('DownloadAccelerator').directive('downloadDisplay', function() {
	  return {
	    templateUrl: '/browseraction/DownloadDisplay/template.html',
	    restrict: 'E',
	    scope: {
	    	downloadState: '='
	    },
	    controller: function($scope) {
	      $scope.test3 = "HI FROM DIRECTIVE 2222";
	    }
	  }
});

console.log('DIRECTIVE LOADED');