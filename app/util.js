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
  },
  getCookieHeaderStr(cb) {
    return chrome.cookies.getAll({}, (cookies) => {
      if (cookies.length == 0) return '';

      let cookieHeaderStr = `Cookie: `;
      cookies.forEach((cookie) => {
        if (cookie.name && cookie.value) {
          cookieHeaderStr += `${cookie.name}=${cookie.value}; `
        }
      });
      
      cb(cookieHeaderStr.slice(0, cookieHeaderStr.length - 2));
    });
  },
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  }
}