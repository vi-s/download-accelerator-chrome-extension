import angular from 'angular';
import ngMaterial from 'angular-material';
import moment from 'moment';
import 'ng-infinite-scroll';
import '../assets/angular-material.min.css';

// Angular Module Setup
let app = angular.module('DownloadAccelerator', ['ngMaterial', 'infinite-scroll']);

module.exports = app;