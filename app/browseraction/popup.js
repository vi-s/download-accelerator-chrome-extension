
// Angular Setup
angular.module('DownloadAccelerator', []);

class DownloadsStateUIManager {
  constructor(downmap, downlist) {
    this.downloadsMap = downmap;
    this.downloadsList = downlist;
  }

  onInit() {
    console.log('I HAVE BEEN INIT');
  }

  onDownloadStateMsg(stateMsg, cb) {
    // stringifed timestamp -> date obj
    if (stateMsg && stateMsg.fileInfo && stateMsg.fileInfo.dateTimeAdded) {
      stateMsg.fileInfo.dateTimeAdded = new Date(JSON.parse(stateMsg.fileInfo.dateTimeAdded));
    }

    if (!this.downloadsMap[stateMsg.fileInfo.id]) {
      stateMsg.fileInfo.arrayIdx = this.downloadsList.length;
    } else {
      let oldState = this.downloadsMap[stateMsg.fileInfo.id];
      stateMsg.fileInfo.arrayIdx = oldState.fileInfo.arrayIdx;
    }

    this.downloadsList[stateMsg.fileInfo.arrayIdx] = stateMsg;
    this.downloadsMap[stateMsg.fileInfo.id] = stateMsg;
    cb();
  }

}

angular.module('DownloadAccelerator').controller('progressController', function($scope) {
  $scope.test = '...test from ctrl';
  // read from local storage on popup init, before any progress msgs from bg page
  $scope.downloadsMap = {};
  $scope.downloadsList = [];

  let dsui = new DownloadsStateUIManager($scope.downloadsMap, $scope.downloadsList);
  dsui.onInit();

  chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.type) {
      case "dlprogmsg":
        dsui.onDownloadStateMsg(request.state, () => {
          $scope.$apply();
        });
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