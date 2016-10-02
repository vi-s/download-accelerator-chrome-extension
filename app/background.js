chrome.webRequest.onBeforeRequest.addListener(function(details){
  //console.log(JSON.stringify(details));
  if (details.url.indexOf('keep') > -1 && details.url.indexOf('name=') > -1) {
    let split = details.url.split('name=');
    if (!(split.length > 1)) {
      return {};
    }
    let fileName = split[1];
    sendNativeMessage({
      fileName: fileName,
      url: details.url
    });
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

var port = null,
    message;

function appendMessage(text) {
  console.log(text);
}

function sendNativeMessage(msg) {
  if (!port) {
    return;
  }

  message = {'body': msg};
  port.postMessage(message);
  appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}

function onNativeMessage(message) {
  appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
}

function onDisconnected() {
  appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  port = null;
}

function connect() {
  var hostName = "com.google.chrome.example.echo";
  appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
  port = chrome.runtime.connectNative(hostName);
  port.onMessage.addListener(onNativeMessage);
  port.onDisconnect.addListener(onDisconnected);
}

connect();






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
