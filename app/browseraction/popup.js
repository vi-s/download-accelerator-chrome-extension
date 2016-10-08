// Angular Module Setup
angular.module('DownloadAccelerator', ['ui.bootstrap']);

// Download state reader / receiver. Responsible for initially reading cached download state map
// from local storage, receiving messages from native app brokered through background page
// DownloadStateWriter class, and updating models used to update the UI.
class DownloadsStateUIManager {
  constructor(downmap, downlist) {
    this.downloadsStateMap = downmap;
    this.downloadStateList = downlist;

    this.populateDownloadStateFromCache();
  }

  // populate cached download state map and list from localstorage
  populateDownloadStateFromCache() {
    let cachedStateMap = localStorage.getItem('download-accel-ext-download-state-map');
    if (!cachedStateMap) {
      return;
    }

    cachedStateMap = JSON.parse(cachedStateMap);
    for (let downloadId in cachedStateMap) {
      if (cachedStateMap.hasOwnProperty(downloadId)) {
        let cachedState = cachedStateMap[downloadId];
        if (cachedState && cachedState.fileInfo && cachedState.fileInfo.dateTimeAdded) {
          cachedState.fileInfo.dateTimeAdded = new Date(JSON.parse(cachedState.fileInfo.dateTimeAdded));
        }

        cachedState.fileInfo.arrayIdx = this.downloadStateList.length;
        this.downloadStateList[cachedState.fileInfo.arrayIdx] = cachedState;
        this.downloadsStateMap[cachedState.fileInfo.id] = cachedState;
      }
    }    
  }

  onDownloadStateMsg(stateMsg, cb) {
    // stringifed timestamp -> date obj
    if (stateMsg && stateMsg.fileInfo && stateMsg.fileInfo.dateTimeAdded) {
      stateMsg.fileInfo.dateTimeAdded = new Date(JSON.parse(stateMsg.fileInfo.dateTimeAdded));
    }

    if (!this.downloadsStateMap[stateMsg.fileInfo.id]) {
      stateMsg.fileInfo.arrayIdx = this.downloadStateList.length;
    } else {
      let oldState = this.downloadsStateMap[stateMsg.fileInfo.id];
      stateMsg.fileInfo.arrayIdx = oldState.fileInfo.arrayIdx;
    }

    this.downloadStateList[stateMsg.fileInfo.arrayIdx] = stateMsg;
    this.downloadsStateMap[stateMsg.fileInfo.id] = stateMsg;
    cb();
  }

}

// Angular Controller Setup
angular.module('DownloadAccelerator').controller('progressController', function($scope) {
  $scope.test = '...test from ctrl';
  // read from local storage on popup init, before any progress msgs from bg page
  $scope.downloadsStateMap = {};
  $scope.downloadStateList = [];

  let dsui = new DownloadsStateUIManager($scope.downloadsStateMap, $scope.downloadStateList);

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