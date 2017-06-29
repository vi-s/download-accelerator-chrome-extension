import angular from 'angular';
import moment from 'moment';
import DownloadsManagerCtrl from '../browseraction/downloadsManagerCtrl';
import downloadDisplay from '../browseraction/DownloadDisplay/directive';
import '../browseraction/style';
import '../assets/icon-try.png';
import '../assets/ic_search_black_48px.svg';
import '../assets/ic_done_black_48px.svg';

// Angular app component wiring
angular.module('DownloadAccelerator')
  .controller('downloadsManagerCtrl', DownloadsManagerCtrl)
  .directive('downloadDisplay', downloadDisplay)
  .constant('moment', moment);