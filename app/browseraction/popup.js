class DownloadTracker {

  constructor() {
    this.downloadStateMap = {};
  }

  addDownload(id, fileName, url) {
    this.downloadStateMap[id] = {
      info: {
        fileName: fileName,
        url: url
      },
      trackingInfo: {

      }
    }
  }
}


let dt = new DownloadTracker();

// dt.addDownload(id, fileName, details.url);

// message -> background page
chrome.extension.sendMessage({
  type: 'frompopup'
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(bg msg rcv);

  switch(request.type) {
    case "frombg":
      console.log(request);
      break;
    // case "color-divs":
    //   colorDivs();
    //    break;
    default:
      break;
  }
  return true;
});


var port = chrome.extension.connect({name: "Download Accelerator"});
port.postMessage("Hi BackGround");
port.onMessage.addListener(function(msg) {
  console.log("message recieved"+ msg);
});