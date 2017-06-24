import DownloadsStateUIManager from "./DownloadsUIManager";

export default ['$scope', '$timeout', function($scope, $timeout) {
  $scope.downloadStateMap = {};
  $scope.downloadStateList = [];
  $scope.filteredDownloadStates = [];
  $scope.downloadSearchQuery = '';
  $scope.showList = false;
  $scope.numToDisplay = 0; // corresponds to limitTo constraint on ngRepeat, manipulated by inf-scroll
  // read from local storage on popup init, before any progress msgs from bg page
  let dsui = new DownloadsStateUIManager($scope.downloadStateMap, $scope.downloadStateList);

  // Remove download handler, updates download backing data structures on removal
  $scope.removeDownload = (download_id) => {
    updateCache(download_id);
    updateBackingDataStructures();
  }

  function updateCache(download_id) {
    // update cache with download state removal
    delete $scope.downloadStateMap[download_id];  
    localStorage.setItem('download-accel-ext-download-state-map', 
      JSON.stringify($scope.downloadStateMap));
  }

  function updateBackingDataStructures(){
    handlePopup();
    handleBg();
    // refresh popup page's state map and download list to reflect deletion  
    function handlePopup() {
      $scope.downloadStateMap = {};
      $scope.downloadStateList = [];

      dsui.refreshDownloadsFromCache($scope.downloadStateMap, $scope.downloadStateList);
    }
    // refresh background page's cached state map to reflect deletion
    function handleBg() {
      chrome.extension.sendMessage({
        type: 'refreshDownloadsFromCache'
      });
    }
  }

  // sroll check function to handle loading more data for infinite scroll
  $scope.loadMoreDownloads = () => {
    if ($scope.numToDisplay + 5 >= $scope.downloadStateList.length) {
      $scope.numToDisplay = $scope.downloadStateList.length;
      return;
    }

    $scope.numToDisplay += 5;
  };

  // delay for animation transition to kick in, using ng-hide => ng-show
  $timeout(() => {
    $scope.showList = true;
  }, 100);

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