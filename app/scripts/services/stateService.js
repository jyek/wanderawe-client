'use strict';

angular.module('wanderaweApp')
  .factory('stateService', ['$rootScope', '$state', function ($rootScope, $state) {
    var svc = {};

    svc.stateInfo = {
      'currentState': undefined,
      'previousState': undefined,
      'currentParams': undefined,
      'previousParams': undefined
    };

    svc.getCurrentState = function () {
      return svc.stateInfo.currentState;
    };

    svc.getPreviousState = function () {
      return svc.stateInfo.previousState;
    };

    svc.getCurrentParams = function () {
      return svc.stateInfo.currentParams;
    };

    svc.getPreviousParams = function () {
      return svc.stateInfo.previousParams;
    };

    svc.setCurrentState = function (state) {
      svc.stateInfo.currentState = state;
    };

    svc.setPreviousState = function (state) {
      svc.stateInfo.previousState = state;
    };

    svc.setCurrentParams = function (params) {
      svc.stateInfo.currentParams = params;
    };

    svc.setPreviousParams = function (params) {
      svc.stateInfo.previousParams = params;
    };


    svc.goToPreviousState = function () {
      var previousState = svc.previousState;
      var previousParams = svc.previousParams;
      var obj = {};

      if (previousState === 'gallery') {
        obj.location = previousParams.location;
        obj.category = previousParams.category;
      } else if (previousState === 'profile') {
        obj.userId = previousParams.userId;
      } else if (previousState === 'singlephoto') {
        obj.id = previousParams.id;
      }

      $state.go(previousState, obj, {
        'reload': true
      });
    };

    return svc;
  }]);
