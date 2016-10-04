
// message -> background page
chrome.extension.sendMessage({
  type: 'frompopup'
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(bg msg rcv);

  switch(request.type) {
    case "dlprogmsg":
      document.getElementById('progContainer').innerHTML = JSON.stringify(request.state);
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