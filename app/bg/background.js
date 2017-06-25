import NativeMessageBroker from './NativeMessageBroker';
import HeaderParser from './HeaderParser';

const nativeMsgBroker = new NativeMessageBroker();
const headerParser = new HeaderParser();

nativeMsgBroker.connect();

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
    case 'refreshDownloadsFromCache':
      nativeMsgBroker.storageBroker.refreshDownloadsFromCache();
      break;
    // case "color-divs":
    //   colorDivs();
    //    break;
    default:
      break;
  }
  return true;
});

chrome.webRequest.onHeadersReceived.addListener((details) => {
  let resHeaderMap = headerParser.extractHeaders(details);
  // handle requests with missing content-type header... catch or not catch missing content-type?
  // if no content-type header, give it application/octet-stream and catch the request for download
  // if (!resHeaderMap['content-type']) resHeaderMap['content-type'] = 'application/octet-stream';
  
  if (headerParser.testContentTypeDownloadable(resHeaderMap['content-type'])) {
    let fileName = headerParser.getFileNameFromHeaders(resHeaderMap, details);
    let fileSize = resHeaderMap['content-length']; // find use for this later
    nativeMsgBroker.sendDownloadInitNativeMsg(fileName, details);
    /**
     * BLOCKING RESPONSE
     * silently cancel the request
     * `cancel: true` param redirects to 'blocked by extension' page, not silent cancellation
     */
    return {
      redirectUrl: 'javascript:'
    };
  }

  return {};
},
// Request Filter
{
  urls: [
    '<all_urls>'
  ],
  types: [ 'main_frame' ]
},
// opt_extraInfoSpec array
["blocking", "responseHeaders"]);

// chrome.webRequest.onBeforeRequest.addListener(function(details){
//   //console.log(JSON.stringify(details));
//   // keep2share support
//   if (details.url.indexOf('keep') > -1 && details.url.indexOf('name=') > -1) {
//     let split = details.url.split('name=');
//     if (!(split.length > 1)) {
//       return {};
//     }
//     var fileName = split[1];
//     nativeMsgBroker.sendDownloadInitNativeMsg(fileName, details);
//   } else if (details.url.indexOf('joker') > -1 && /\/\/fs[0-9 ]{2}\.filejoker/.test(details.url)) {
//     let split = details.url.split('/');
//     var fileName = split[split.length - 1]

//     chrome.cookies.get({
//       url: 'https://filejoker.net',
//       name: 'joker_cook'
//     }, (cookie) => {
//       let cookieHeaderStr = cookie ? `Cookie: ${cookie.name}=${cookie.value}` : '';
//       nativeMsgBroker.sendDownloadInitNativeMsg(fileName, details, cookieHeaderStr);
//     });

//   } else if (details.url.indexOf('138.68.41.100') > -1) {
//     let split = details.url.split('/');
//     var fileName = split[split.length - 1];

//     if (! /.+\.[a-zA-Z]{2,}/.test(fileName)) {
//       return {};
//     }

//     nativeMsgBroker.sendDownloadInitNativeMsg(fileName, details);
//   } else {
//     return {};
//   }

//   // silently cancel the request
//   let blockingResponse = {
//     redirectUrl: 'javascript:'
//   };

//   return blockingResponse;
// },
// // Request Filter
// {
//   urls: [
//     // '<all_urls>',
//     '*://*.keep2share.cc/*',
//     '*://*.filejoker.net/*',
//     '*://138.68.41.100/*'
//   ],
//   types: [ 'main_frame' ]
// },
// // opt_extraInfoSpec array
// ['requestBody','blocking']);


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
