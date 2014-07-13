'use strict';

angular.module('wanderaweApp')
  .factory('mobileService', ['$window', function ($window) {
    var svc = {};

    svc.getCurrentScreenSize = function () {
      return $window.innerWidth;
    };

    svc.isDesktop = function () {
      return svc.getCurrentScreenSize() > 992;
    };

    svc.isTablet = function () {
      return svc.getCurrentScreenSize() > 768 && svc.getCurrentScreenSize() <= 992;
    };

    svc.isPhone = function () {
      return svc.getCurrentScreenSize() <= 768;
    };

    return svc;
  }]);