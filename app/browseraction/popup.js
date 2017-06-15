// Angular Module Setup
angular.module('DownloadAccelerator', ['ngMaterial']);

// Download state reader / receiver. Responsible for initially reading cached download state map
// from local storage, receiving messages from native app brokered through background page
// DownloadStateWriter class, and updating models used to update the UI.
class DownloadsStateUIManager {
  constructor(downmap, downlist) {
    this.refreshDownloadsFromCache(downmap, downlist);
  }

  refreshDownloadsFromCache(downmap, downlist) {
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
          cachedState.fileInfo.dateTimeAdded = new Date(cachedState.fileInfo.dateTimeAdded);
        }

        this.downloadsStateMap[cachedState.fileInfo.id] = cachedState;
        this.downloadStateList.push(cachedState);
      }
    }    
  }

  onDownloadStateMsg(stateMsg, cb) {
    // download not started, not in local cache
    if (!this.downloadsStateMap[stateMsg.fileInfo.id]) {
      // stringifed timestamp -> date obj
      stateMsg.fileInfo.dateTimeAdded = new Date(stateMsg.fileInfo.dateTimeAdded);
      this.downloadsStateMap[stateMsg.fileInfo.id] = stateMsg;
      this.downloadStateList.push(stateMsg);
    } else { // download started, in local cache
      // if dl info already in local storage, only update tracking info upon state msg
      // only map update is necessary, it will propogate to list's shared obj
      this.downloadsStateMap[stateMsg.fileInfo.id].trackingInfo = stateMsg.trackingInfo;
    }

    cb();
  }
}

// Angular Controller Setup
angular.module('DownloadAccelerator').controller('progressController', function($scope) {
  $scope.test = '...test from ctrl';
  // read from local storage on popup init, before any progress msgs from bg page
  $scope.downloadsStateMap = {};
  $scope.downloadStateList = [];
  $scope.filteredDownloadStates = [];
  $scope.downloadSearchQuery = '';

  let dsui = new DownloadsStateUIManager($scope.downloadsStateMap, $scope.downloadStateList);

  $scope.removeDownload = (download_id) => {
		// update cache with download state removal
	  $scope.downloadsStateMap[download_id] = undefined;  
    localStorage.setItem('download-accel-ext-download-state-map', 
      JSON.stringify($scope.downloadsStateMap));

    // refresh popup page's state map and download list to reflect deletion  
    $scope.refreshDownloadsFromCache();

    // refresh background page's cached state map to reflect deletion
    chrome.extension.sendMessage({
      type: 'refreshDownloadsFromCache'
    });
  }

  $scope.refreshDownloadsFromCache = () => {
    $scope.downloadsStateMap = {};
    $scope.downloadStateList = [];

    dsui.refreshDownloadsFromCache($scope.downloadsStateMap, $scope.downloadStateList);
  }

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