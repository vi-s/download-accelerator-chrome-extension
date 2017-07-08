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
  extractRootDomain(url) {
    // ?: indicates a non capturing group
    let matches = url.match(/^(?:ftp|https?)\:\/\/(?:www\.)?([^\/:?#]+\.[^\/:?#]+)(?:[\/:?#]|$)/i),
        domain = matches && matches[1], // domain will be null if no match is found
        domainArr = domain && domain.split('.'),
        len = domainArr && domainArr.length;

    // ip address
    if (/^[0-9\.]+$/g.test(domain)) return domain;

    // xx.xx top level domains like co.uk as opposed to simple.com
    if (len > 2 && domainArr[len - 1].length == 2 && 
          domainArr[len - 1].length - domainArr[len - 2].length == 0) {
      return domainArr.slice(len - 3).join('.');
    } 
    
    // handle majority domains that include subdomains, exclude subdomains i.e. prx-125.k2cc.com
    if (len > 2){
      return domainArr.slice(len - 2).join('.');          
    }

    // handle len == 2 cases, just return the regex match, i.e. download.com
    return domain ? domain : '';
  }
}