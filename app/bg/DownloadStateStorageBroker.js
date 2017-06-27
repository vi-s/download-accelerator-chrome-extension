/**
 * This class handles writing download state information to locale storage,
 * holding download state info from cache in memory in the downloadStateMap.
 * as well as managing synchronization between memory map and locale storage download
 * state info by refreshing in memory map to reflect changes from front-end SPA popup.
 */

export default class DownloadStateStorageBroker {

  constructor() {
    this.downloadStateMap = {};
    this.refreshDownloadsFromCache();
  }

  addDownload(id, fileName, fileSize, url) {
    this.downloadStateMap[id] = {
      fileInfo: {
        id: id,
        fileName: fileName,
        fileSize: fileSize,
        url: url,
        dateTimeAdded: (new Date()).toISOString()
      },
      trackingInfo: {
        state: 'active'
      }
    }

    this.saveDLState();
  }

  refreshDownloadsFromCache() {
    let cachedState = localStorage.getItem('download-accel-ext-download-state-map');
    if (cachedState) {
      this.downloadStateMap = JSON.parse(cachedState);
    }
  }

  onDownloadProgMsg(msg) {
    if (!(msg && msg.id) || !this.downloadStateMap[msg.id]) {
      return;
    }

    let dlState = this.downloadStateMap[msg.id];
    dlState.trackingInfo.filesize = msg.filesize ? msg.filesize : dlState.trackingInfo.filesize;
    dlState.trackingInfo.percent = msg.percent;
    dlState.trackingInfo.transferSpeed = msg.transferSpeed ? msg.transferSpeed : dlState.trackingInfo.transferSpeed;
    dlState.trackingInfo.eta = this.getETA(msg);

    if (msg.percent == '100') dlState.trackingInfo.state = 'finished';
    this.saveDLState();

    // send dl state message from native app to popup
    chrome.extension.sendMessage({
      type: 'dlprogmsg',
      state: dlState
    });
  }

  updateState(downloadid, state) {
    this.downloadStateMap[downloadid].trackingInfo.state = state;
    this.saveDLState();
  }

  saveDLState() {
    localStorage.setItem('download-accel-ext-download-state-map', JSON.stringify(this.downloadStateMap));
    return;
  }

  getETA(msg) {
    let percentDone = parseFloat(msg.percent),
        speedK = parseFloat(msg.transferSpeed), // speed kbps
        filesize = parseFloat(msg.filesize),
        percentLeft = 100 - percentDone,
        estimatedBytesLeft = (percentLeft / 100.0) * filesize,
        etaSeconds = (estimatedBytesLeft / 1000) * (1 / speedK);

    if (etaSeconds < 60) { // less than one minute
      return `00:00:${addZeroToTime(Math.floor(etaSeconds))}`;
    } else if (etaSeconds < 60*60) { // less than 1 hour
      let minutes = Math.floor(etaSeconds / 60);
      let seconds = Math.floor(etaSeconds - (minutes * 60));
      return `00:${addZeroToTime(minutes)}:${addZeroToTime(seconds)}`;
    } else { // an hour or more
      let hours = Math.floor(etaSeconds / (60 * 60));
      let nonHrSeconds = etaSeconds - (hours * 60 * 60); // second excluding hours
      let minutes = Math.floor(nonHrSeconds / 60);
      let seconds = Math.floor(etaSeconds - (hours * 60 * 60) - (minutes * 60));
      return `${addZeroToTime(hours)}:${addZeroToTime(minutes)}:${addZeroToTime(seconds)}`;
    }

    function addZeroToTime(time) {
      return time < 10 ? `0${time}` : `${time}`;
    }
  }

}
