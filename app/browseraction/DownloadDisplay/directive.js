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

				$scope.humanTransferSpeed = (speedK) => {
					speedK = parseFloat(speedK) * 1000;
					return $scope.humanFileSize(speedK, true);
				}

	      $scope.humanFileSize = (bytes, si) => {
			    var thresh = si ? 1000 : 1024;
			    if(Math.abs(bytes) < thresh) {
			        return bytes + ' B';
			    }
			    var units = si
			        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
			        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
			    var u = -1;
			    do {
			        bytes /= thresh;
			        ++u;
			    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
			    return bytes.toFixed(1)+' '+units[u];
			  }

	    }
	  }
});

console.log('DownloadDisplay DIRECTIVE LOADED');
