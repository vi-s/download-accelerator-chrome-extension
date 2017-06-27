import moment from 'moment';
import template from './template.html';
// var scripts = document.getElementsByTagName("script")
// var currentScriptPath = scripts[scripts.length-1].src;
// currentScriptPath.replace('directive.js', 'template.html')

export default function() {
    return {
        template: template,
        restrict: 'E',
        scope: {
          downloadState: '=',
          removeFn: '='
        },
        controller: ['$scope', 'moment', '$timeout', function($scope, moment, $timeout) {
          $scope.fileSize = getFileSize();
          
          $scope.togglePause = (event) => {
            let downloadState = $scope.downloadState;
            if (downloadState.trackingInfo.state === 'canceled') {
              return;
            }

            if (downloadState.trackingInfo.state !== 'paused') {
              downloadState.trackingInfo.state = 'paused';
              chrome.extension.sendMessage({
                  type: 'pauseDownload',
                  downloadid: $scope.downloadState.fileInfo.id
              });
            } else {
              downloadState.trackingInfo.state = 'active';
              chrome.extension.sendMessage({
                  type: 'unpauseDownload',
                  downloadid: $scope.downloadState.fileInfo.id
              });
            }
          };

          $scope.cancelDownload = (event) => {
            $scope.downloadState.trackingInfo.state = 'canceled';
            chrome.extension.sendMessage({
                type: 'cancelDownload',
                downloadid: $scope.downloadState.fileInfo.id
            });
          };

          $scope.removeCard = (event) => {
            $scope.cancelDownload();
            $timeout(() => {
              let fileInfo = $scope.downloadState.fileInfo;
              if (!fileInfo) return;
              $scope.removeFn(fileInfo.id);
            }, 300)
          };

          $scope.getTimeAgo = () => {
            return moment($scope.downloadState.fileInfo.dateTimeAdded).fromNow();
          }; 

          $scope.humanTransferSpeed = (speedK) => {
            speedK = parseFloat(speedK) * 1000;
            return humanFileSize(speedK, true);
          }

          function getFileSize() {
            let bytes = Number($scope.downloadState.fileInfo.fileSize);
            if (isNaN(bytes)) {
              console.log('ERROR CALCULATING FILE SIZE OF VAL:' + $scope.downloadState.fileInfo.fileSize);
              return '?';
            }

            return humanFileSize(bytes, true);
          };

          function humanFileSize(bytes, si) {
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
          };
      }]
    }
};

console.log('DownloadDisplay DIRECTIVE LOADED');