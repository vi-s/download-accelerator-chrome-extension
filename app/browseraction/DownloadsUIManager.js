// Download state reader / receiver. Responsible for initially reading cached download state map
// from local storage, receiving messages from native app brokered through background page
// DownloadStateWriter class, and updating models used to update the UI.
export default class DownloadsStateUIManager {
  constructor(downmap, downlist) {
    this.refreshDownloadsFromCache(downmap, downlist);
  }

  refreshDownloadsFromCache(downmap, downlist) {
    this.downloadStateMap = downmap;
    this.downloadStateList = downlist;
    this.populateDownloadStateFromCache();
  }

  // populate cached download state map and list from localstorage
  populateDownloadStateFromCache() {
    let cachedStateMap = localStorage.getItem('download-accel-ext-download-state-map');
    if (!cachedStateMap) return;
    cachedStateMap = JSON.parse(cachedStateMap);

    Object.keys(cachedStateMap).forEach((downloadId) => {
      let cachedState = cachedStateMap[downloadId];
      if (cachedState && cachedState.fileInfo && cachedState.fileInfo.dateTimeAdded) {
        cachedState.fileInfo.dateTimeAdded = new Date(cachedState.fileInfo.dateTimeAdded);
      }

      this.downloadStateMap[cachedState.fileInfo.id] = cachedState;
      this.downloadStateList.push(cachedState);
    });

    // sort the download state list by date, inverted order, meaning newest dates before older dates
    this.downloadStateList.sort(function(a,b){
      return b.fileInfo.dateTimeAdded - a.fileInfo.dateTimeAdded;
    });
  }

  /**
   * Progress messages objects are of the form: {
   *  fileInfo: { ... },
   *  trackingInfo: { ... }
   * }
   */
  onDownloadStateMsg(stateMsg, cb) {
    // download not started, not in local cache
    if (!this.downloadStateMap[stateMsg.fileInfo.id]) {
      // stringifed timestamp -> date obj
      stateMsg.fileInfo.dateTimeAdded = new Date(stateMsg.fileInfo.dateTimeAdded);
      this.downloadStateMap[stateMsg.fileInfo.id] = stateMsg;
      this.downloadStateList.push(stateMsg);
    } else { // download started, in local cache
      // if dl info already in local storage, only update tracking info upon state msg, not file info
      // only map update is necessary, it will propogate to list's shared obj

      // copy current state to updated tracking info
      stateMsg.trackingInfo.state = this.downloadStateMap[stateMsg.fileInfo.id].trackingInfo.state;
      this.downloadStateMap[stateMsg.fileInfo.id].trackingInfo = stateMsg.trackingInfo;
    }

    cb();
  }
}