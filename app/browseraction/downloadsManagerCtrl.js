import DownloadsStateUIManager from "./DownloadsUIManager";

export default ['$scope', '$timeout', function($scope, $timeout) {
  $scope.test = '...test from ctrl';
  // read from local storage on popup init, before any progress msgs from bg page
  $scope.downloadStateMap = {};
  $scope.downloadStateList = [];
  $scope.filteredDownloadStates = [];
  $scope.downloadSearchQuery = '';
  $scope.showList = false;
  $scope.numToDisplay = 0; // corresponds to limitTo constraint on ngRepeat, manipulated by inf-scroll

  let dsui = new DownloadsStateUIManager($scope.downloadStateMap, $scope.downloadStateList);

  $timeout(() => {
    $scope.showList = true;
  }, 50);

  $scope.loadMoreDownloads = () => {
    if ($scope.numToDisplay + 5 >= $scope.downloadStateList.length) {
      $scope.numToDisplay = $scope.downloadStateList.length;
      return;
    }

    $scope.numToDisplay += 5;
  };

  $scope.removeDownload = (download_id) => {
    // update cache with download state removal
    delete $scope.downloadStateMap[download_id];  
    localStorage.setItem('download-accel-ext-download-state-map', 
      JSON.stringify($scope.downloadStateMap));
    // refresh popup page's state map and download list to reflect deletion  
    $scope.refreshDownloadsFromCache();
    // refresh background page's cached state map to reflect deletion
    chrome.extension.sendMessage({
      type: 'refreshDownloadsFromCache'
    });
  }

  $scope.refreshDownloadsFromCache = () => {
    $scope.downloadStateMap = {};
    $scope.downloadStateList = [];

    dsui.refreshDownloadsFromCache($scope.downloadStateMap, $scope.downloadStateList);
  }

  chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.type) {
      case 'dlprogmsg':
        dsui.onDownloadStateMsg(request.state, () => {
          $scope.$apply();
        });
        break;
      default:
        break;
    }
    return true;
  });

}];