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
      trackingInfo: {}
    }
  }

  onDownloadProgMsg(msg) {
    if (!(msg && msg.id) || !this.downloadStateMap[msg.id]) {
      return;
    }

    let dlState = this.downloadStateMap[msg.id];
    dlState.trackingInfo.filesize = msg.filesize;
    dlState.trackingInfo.percent = msg.percent;
    dlState.trackingInfo.transferSpeed = msg.transferSpeed;

    chrome.extension.sendMessage({
      type: 'dlprogmsg',
      state: dlState
    });

    console.log(this.getETA(msg));
  }

  saveDLState() {
    return;
  }

  getETA(msg) {
    let percentDone = parseFloat(msg.percent),
        speedK = parseFloat(msg.transferSpeed), // speed kbps
        filesize = parseFloat(msg.filesize);

    let percentLeft = 100 - percentDone,
        estimatedBytesLeft = (percentLeft/100.0) * filesize;

    let etaSeconds = (estimatedBytesLeft/1000) * (1 / speedK);
    let retStr;
    return etaSeconds
    // if (etaSeconds < 60) { // less than one minute
    //   let secondsStr = addZeroToTime(etaSeconds);
    //   retStr = `00:00:${secondsStr}`;
    // } else if (etaSeconds < 60*60) { // less than 1 hour
    //   let minutes = Math.floor(etaSeconds / 60);
    //   let seconds = Math.ceil(((etaSeconds / 60) - minutes) * 60)
    //   let minutesStr = addZeroToTime(minutes);
    //   let secondsStr = addZeroToTime(seconds);
    //   retStr = `00:${minutesStr}:${secondsStr}`;
    // } else { // an hour or more
    //   let hours = Math.floor(etaSeconds / (60 * 60));
    //   let secondsLeft = Math.ceil(((etaSeconds / (60 * 60)) - hours) * 60); // second excluding hours
    //   let minutes = Math.floor(secondsLeft / 60);
    //   let seconds = Math.ceil(((etaSeconds / 60) - minutes) * 60)
    //   let hoursStr = addZeroToTime(hours);
    //   let minutesStr = addZeroToTime(minutes);
    //   let secondsStr = addZeroToTime(seconds);
    //   retStr = `${hoursStr}:${minutesStr}:${secondsStr}`;
    // }

    // return retStr;

    // function addZeroToTime(time) {
    //   if (time < 10) {
    //     return `0${time}`
    //   } else {
    //     retStr = `${time}`
    //   }
    // }
  } 
}


let dt = new DownloadTracker();

var nativePort = null,
    message;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

function isDLProgressMsg(message) {
  if (!message) {
    return;
  }

  if (message.id && message.filesize && message.percent && message.transferSpeed) {
    dt.onDownloadProgMsg(message);
  }  
}

function appendMessage(text) {
  console.log(text);
}

function sendNativeMessage(msg) {
  if (!nativePort) {
    return;
  }

  message = {'body': msg};
  nativePort.postMessage(message);
  appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}

function onNativeMessage(message) {
  isDLProgressMsg(message);
  appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
}

function onDisconnected() {
  appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  nativePort = null;
}

function connect() {
  var hostName = "com.google.chrome.example.echo";
  appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
  nativePort = chrome.runtime.connectNative(hostName);
  nativePort.onMessage.addListener(onNativeMessage);
  nativePort.onDisconnect.addListener(onDisconnected);
}

connect();

// message from popup.js
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(bg msg rcv);
  switch(request.type) {
    case "frompopup":
      chrome.extension.sendMessage({
        type: 'frombg'
      });
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

chrome.webRequest.onBeforeRequest.addListener(function(details){
  //console.log(JSON.ssringify(details));
  if (details.url.indexOf('keep') > -1 && details.url.indexOf('name=') > -1) {
    let split = details.url.split('name=');
    if (!(split.length > 1)) {
      return {};
    }
    let fileName = split[1];
    let id = uuid();
    let downloadMsg = {
      id: id,
      fileName: fileName,
      url: details.url
    };
    sendNativeMessage(downloadMsg);
    dt.addDownload(id, fileName, details.url);

    console.log('uuid', id);
    console.log('k2cc file found:', fileName);
    console.log('@URL:', details.url);
  } else {
    return {};
  }

  // silently cancel the request
  let blockingResponse = {
    redirectUrl: 'javascript:'
  };

  return blockingResponse;
},
// Request Filter
{
  urls: [
    // '<all_urls>',
    '*://*.keep2share.cc/*'
  ],
  types: [ 'main_frame' ]
},
// opt_extraInfoSpec array
['requestBody','blocking']);


/* WEB REQUEST HEADER INTERCEPTION/MODIFICATION EXAMPLE */

//
// chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
//   //console.log(JSON.stringify(details));
//   var headers = details.requestHeaders,
//   blockingResponse = {};
//
//   // Each header parameter is stored in an array. Since Chrome
//   // makes no guarantee about the contents/order of this array,
//   // you'll have to iterate through it to find for the
//   // 'User-Agent' element
//   for( var i = 0, l = headers.length; i < l; ++i ) {
//     if( headers[i].name == 'User-Agent' ) {
//       // headers[i].value = '>>> Your new user agent string here <<<';
//       console.log(headers[i].value);
//       break;
//     }
//     // If you want to modify other headers, this is the place to
//     // do it. Either remove the 'break;' statement and add in more
//     // conditionals or use a 'switch' statement on 'headers[i].name'
//   }
//
//   // request is sent with blockRequest.requestHeaders
//   blockingResponse.requestHeaders = headers;
//   return blockingResponse;
// },
// // Request Filter
// {
//   urls: [
//     // '<all_urls>',
//     '*://*.keep2share.cc/*'
//   ],
//   types: [ 'main_frame' ]
// },
// [
//   'requestHeaders',
//   'blocking'
// ]);
