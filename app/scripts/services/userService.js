'use strict';

angular.module('wanderaweApp')
  .factory('userService', ['$cookieStore', function ($cookieStore) {
    var access = routingConfig.accessLevels;
    var role = routingConfig.userRoles;
    var generalUser = { username: '', role: role.public };
    var currentUser = $cookieStore.get('currentUser') || generalUser;

    var svc = {};

    svc.getCurrentUserId = function () {
      // returns a string or undefined (if the user is not logged in)
      return currentUser._id;
    };

    svc.getCurrentUserRole = function () {
      // always returns a number representing the user role
      return role;
    };

    svc.getCurrentUserName = function () {
      // either Wanderer or a valid userId
      if (svc.getCurrentUserId()) {
        if (currentUser.local) {
          return currentUser.local.username; // use wanderawe username
        } else if (currentUser.facebook) {
          return currentUser.facebook.name; // use facebook name
        } else {
          return currentUser.twitter.username; // use twitter handle
        }
      } else {
        return 'Wanderer';
      }
    };

    svc.getLoginMethod = function () {
      if (currentUser.twitter) {
        return 'twitter';
      } else if (currentUser.facebook) {
        return 'facebook';
      } else if (currentUser.local) {
        return 'email';
      } else {
        return 'not logged in';
      }
    };

    svc.isAuthorized = function (accessLevel, userRole) {
      currentUser = $cookieStore.get('currentUser') || generalUser;
      return (accessLevel <= userRole);
    };
    
    svc.isLoggedIn = function () {
      currentUser = $cookieStore.get('currentUser') || generalUser;
      return (currentUser.role >= role.user);
    };

    return svc;
  }]);

