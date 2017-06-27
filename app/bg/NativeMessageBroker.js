/**
 * Native message broker between chrome web extension and native host application.
 * Responsible for communication between these two central components of this
 * larger download accelerator project.
 */
import DownloadStateStorageBroker from './DownloadStateStorageBroker';
import $util from '../util';

export default class NativeMessageBroker {

  constructor() {
    this.storageBroker = new DownloadStateStorageBroker();
    this.nativePort;
  }

  connect() {
    var hostName = "com.google.chrome.example.echo";
    console.log("Connecting to native messaging host <b>" + hostName + "</b>")
    this.nativePort = chrome.runtime.connectNative(hostName);
    this.nativePort.onMessage.addListener(this.onNativeMessage.bind(this));
    this.nativePort.onDisconnect.addListener(this.onDisconnected.bind(this));
  }

  onDisconnected() {
    console.log("Failed to connect: " + chrome.runtime.lastError.message);
    this.nativePort = undefined;
  }

  onNativeMessage(message) {
    console.log("Received message: <b>" + JSON.stringify(message) + "</b>");
    this.handleMessageTypeCheck(message);
  }

  sendNativeMessage(msg) {
    if (!this.nativePort) {
      return;
    }

    let message = {'body': msg};
    this.nativePort.postMessage(message);
    console.log("Sent message: <b>" + JSON.stringify(message) + "</b>");
  }

  sendDownloadInitNativeMsg(fileName, fileSize, details, cookieHeaderStr) {
    let id = this.uuid();

    let downloadMsg = {
      id: id,
      fileName: fileName,
      url: details.url,
      cookieHeader: cookieHeaderStr ? cookieHeaderStr : ''
    };

    this.sendNativeMessage(downloadMsg);
    this.storageBroker.addDownload(id, fileName, fileSize, details.url);
    $util.displaySuccessBadge('added!', 3000);

    console.log('Download UUID:', id);
    console.log('File Found Name:', fileName);
    console.log('@URL:', details.url);
  }
  
  handleMessageTypeCheck(message) {
    if (!message) {
      return;
    }

    // making these two props optional for now
    // && message.transferSpeed
    // && message.filesize
    if (message.id && message.percent) {
      this.storageBroker.onDownloadProgMsg(message);
    }
  }

  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  }

}