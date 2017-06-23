import DownloadsStateUIManager from "./DownloadsUIManager";

export default ['$scope', function($scope) {
  $scope.test = '...test from ctrl';
  // read from local storage on popup init, before any progress msgs from bg page
  $scope.downloadStateMap = {};
  $scope.downloadStateList = [];
  $scope.filteredDownloadStates = [];
  $scope.downloadSearchQuery = '';

  let dsui = new DownloadsStateUIManager($scope.downloadStateMap, $scope.downloadStateList);

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
    console.log('test');
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

}];