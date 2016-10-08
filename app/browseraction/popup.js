
// Angular Setup
angular.module('DownloadAccelerator', []);

angular.module('DownloadAccelerator').controller('progressController', function($scope) {
  $scope.test = 'Hello World, From Controlla';
  $scope.downloadsMap = {}; // read from local storage on popup init, before any progress msgs from bg page
  $scope.downloadsList = [];

  $scope.downloadsMap['1'] = {
    fileInfo: {
      fileName: 'A TEST FILENAME',
      dateTimeAdded: new Date("2016-10-08T07:23:28.554Z")
    }
  };

  $scope.downloadsMap['2'] = {
    fileInfo: {
      fileName: 'ZZZZ ANOTHER TEST FILENAME',
      dateTimeAdded: new Date("2016-10-08T07:24:08.432Z")
    }
  };

  $scope.downloadsMap['3'] = {
    fileInfo: {
      fileName: 'YYYY ANOTHER TEST FILENAME',
      dateTimeAdded: new Date("2016-10-08T07:24:22.335Z")
    }
  };

  $scope.downloadsList.push($scope.downloadsMap['2']);
  $scope.downloadsList.push($scope.downloadsMap['1']);
  $scope.downloadsList.push($scope.downloadsMap['3']);

  class DownloadsStateUIManager {
    constructor() {
      this.downloadsMap = $scope.downloadsMap;
      this.downloadsList = $scope.downloadsList;
    }

    onDownloadStateMsg(stateMsg) {
      if (!this.downloadsMap[stateMsg.fileInfo.id]) {
        this.onNewDownloadStateMsg(stateMsg);
      }
      this.downloadsMap[stateMsg.fileInfo.id] = stateMsg;
    }

    onNewDownloadStateMsg(stateMsg) {
      this.downloadsList.push(stateMsg);
    }
  }

  let dsui = new DownloadsStateUIManager($scope.downloads);

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
      case "dlprogmsg":
        // document.getElementById('progContainer').innerHTML = JSON.stringify(request.state);
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