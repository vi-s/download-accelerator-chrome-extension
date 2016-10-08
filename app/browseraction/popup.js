
// Angular Setup
angular.module('DownloadAccelerator', []);

angular.module('DownloadAccelerator').controller('progressController', function($scope) {
  $scope.test = '...test from ctrl';
  $scope.downloadsMap = {}; // read from local storage on popup init, before any progress msgs from bg page
  $scope.downloadsList = [];

  class DownloadsStateUIManager {
    constructor() {
      this.downloadsMap = $scope.downloadsMap;
      this.downloadsList = $scope.downloadsList;
    }

    onDownloadStateMsg(stateMsg) {
      // stringifed timestamp -> date obj
      if (stateMsg && stateMsg.fileInfo && stateMsg.fileInfo.dateTimeAdded) {
        stateMsg.fileInfo.dateTimeAdded = new Date(JSON.parse(stateMsg.fileInfo.dateTimeAdded));
      }

      if (!this.downloadsMap[stateMsg.fileInfo.id]) {
        stateMsg.fileInfo.arrayIdx = this.downloadsList.length;
        this.downloadsList.push(stateMsg);
      } else {
        let oldState = this.downloadsMap[stateMsg.fileInfo.id];
        let arrayIdx = oldState.fileInfo.arrayIdx;
        stateMsg.fileInfo.arrayIdx = arrayIdx;
        this.downloadsList[arrayIdx] = stateMsg;
      }
      this.downloadsMap[stateMsg.fileInfo.id] = stateMsg;
      $scope.$apply();
    }


  }

  let dsui = new DownloadsStateUIManager();

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
      case "dlprogmsg":
        // document.getElementById('progContainer').innerHTML = JSON.stringify(request.state);
        console.log('msg recvd');
        console.log('dl list len:', $scope.downloadsList.length);
        dsui.onDownloadStateMsg(request.state);
        break;
      default:
        break;
    }
    return true;
  });

});

// message -> background page
chrome.extension.sendMessage({
  type: 'frompopup'
});