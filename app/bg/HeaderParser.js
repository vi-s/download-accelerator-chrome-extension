
export default class HeaderParser {

  constructor() {
    this.defaultFileName = 'download';
  }

  extractHeaders(details) {
    let headerMap = {};
    details.responseHeaders.forEach((e) => {
      headerMap[e.name.toLowerCase()] = e.value; // case insensitivize http headers
    });
    return headerMap;
  }

  testContentTypeDownloadable(contentType) {
    // check for audio and video mime types
    if (/^(audio|video)/.test(contentType)) {
      return true;
    }
    // check application subcases for downloadable file types
    if (/^application\/.*(octet\-?stream|compressed|rar|tar|zip|7z).*/.test(contentType)) {
      return true;
    }

    return false;
  }

  getFileNameFromHeaders(resHeaderMap, details) {
    let fileName;
    // first check content disposition header for attachment filename
    if (resHeaderMap['content-disposition']) {
      fileName = resHeaderMap['content-disposition']
        .replace('attachment; filename=', '')
        .replace(/['"]/g, '');
    }
    // check for redirection header
    else if(resHeaderMap['location']) {
      fileName = this.getFileNameFromPath(resHeaderMap['location']);
    }
    // use url as path for filename extraction
    else {
      fileName = this.getFileNameFromPath(details.url);
    }

    return this.validateFileName(fileName) ? fileName : this.getDefaultFileName();
  }

  getDefaultFileName() {
    // append default file name with timestamp to avoid name colissions
    return `${this.defaultFileName}_${(new Date()).toISOString().replace(/:/g,'.')}`;
  }

  // downloadable files usually have a file extension at least 2 chars long following a name
  validateFileName(fileName) {
    return /^.+\.[a-zA-Z0-9]{2,}$/.test(fileName);
  }

  // Also works on URLs
  getFileNameFromPath(path) {
    // if last char is / or \, exclude the slash
    if (/[\/\\]/.test(path[path.length - 1])) path = path.slice(0,path.length - 1);
    // remove all contents before final slash.
    return path.replace(/^.*[\\\/]/, '')
  }

}

