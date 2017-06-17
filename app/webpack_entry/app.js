import angular from 'angular';
import moment from 'moment';
import DownloadsManagerCtrl from '../browseraction/downloadsManagerCtrl';
import downloadDisplay from '../browseraction/DownloadDisplay/directive';
import '../browseraction/style.css';

// Angular app component wiring
angular.module('DownloadAccelerator')
  .controller('downloadsManagerCtrl', DownloadsManagerCtrl)
  .directive('downloadDisplay', downloadDisplay)
  .constant('moment', moment);