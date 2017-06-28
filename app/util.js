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
  getCookieHeaderStr(domain, cb) {
    return chrome.cookies.getAll({
      domain: domain
    }, (cookies) => {
      if (!cookies || cookies.length == 0) {
        cb('')
        return;
      }
      
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
  },
  extractBaseURL(url) {
    var pathArray = url.split( '/' );
    var protocol = pathArray[0];
    var host = pathArray[2];
    return protocol + '//' + host;
  },
  extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
  },
  extractRootDomain(url) {
    var domain = this.extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    }
    return domain;
  }
}