'use strict';

angular.module('wanderaweApp')
  .factory('messageService', ['$rootScope', '$cookieStore', 'userService', function ($rootScope, $cookieStore, userService) {
    var svc = {};

    svc.welcomeMessage = function () {
      return 'Welcome ' + $rootScope.currentUserName;
      // if ($rootScope.currentState === 'gallery') {
      //   return $rootScope.currentUserName + ', welcome to ' + $rootScope.currentParams.location + ' : ' + $rootScope.currentParams.category;
      // } else {
      //   return 'Welcome ' + $rootScope.currentUserName;
      // }
    };

    svc.actualMessage = function () {
      if ($rootScope.currentState === 'gallery') {
        return $rootScope.currentParams.location + ' : ' + $rootScope.currentParams.category;
      } else if (userService.isLoggedIn($cookieStore.get('currentUser'))) {
        return svc.welcomeMessage();
      }
    };

    svc.capitalize = function (string) {
      if (typeof string === 'string') {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
      } else {
        return '';
      }
    };

    return svc;
  }]);