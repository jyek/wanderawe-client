'use strict';

angular.module('wanderaweApp')
  .factory('resizeService', ['$window', function ($window) {
    var svc = {};

    svc.getScalingFactorHeight = function (photoHeight, gridHeight) {
      return parseInt(photoHeight, 10) / gridHeight;
    };

    svc.getScalingFactorWidth = function (photoWidth, gridWidth) {
      return parseInt(photoWidth, 10) / gridWidth;
    };

    svc.getFinalDimensions = function (photoHeight, photoWidth, gridHeight, gridWidth) {
      var heightRatio = svc.getScalingFactorHeight(photoHeight, gridHeight);
      var widthRatio = svc.getScalingFactorWidth(photoWidth, gridWidth);
      var finalWidth;
      var finalHeight;

      if (widthRatio > 1 || heightRatio > 1) {
        if (widthRatio >= heightRatio) {
          finalWidth = gridWidth;
          finalHeight = parseInt(photoHeight, 10) / widthRatio;
        } else {
          finalWidth = parseInt(photoWidth, 10) / heightRatio;
          finalHeight = gridHeight;
        }
      } else {
        finalWidth = parseInt(photoWidth, 10);
        finalHeight = parseInt(photoHeight, 10);
      }

      return {
        width: finalWidth,
        height: finalHeight
      };
    };

    // Gallery Controller
    svc.getSize = function (maxSize) {
      var factor = Math.ceil($window.innerWidth / maxSize);
      return Math.floor($window.innerWidth / factor);
    };

    return svc;
  }]);
