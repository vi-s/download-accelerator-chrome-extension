
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

function createDownloadDiv() {
  
}