'use strict';

export default {
  displayBadge(text, time) {
    chrome.browserAction.setBadgeText({text: text});
    setTimeout(() => {
      chrome.browserAction.setBadgeText({text: ''});
    }, time);
  },
  setBadgeColorGreen() {
    chrome.browserAction.setBadgeBackgroundColor({ color: '#41f47c'});
  },
  setBadgeColorRed() {
    chrome.browserAction.setBadgeBackgroundColor({ color: '#f44242'});    
  },
  displaySuccessBadge(text, time) {
    this.displayBadge(text, time);
    this.setBadgeColorGreen();
  },
  displayErrorBadge(text, time) {
    this.displayBadge(text, time);
    this.setBadgeColorRed();
  }
}