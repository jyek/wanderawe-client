'use strict';

angular.module('wanderaweApp')
  .factory('navigationService', ['$state', 'mobileService', function ($state, mobileService) {
    var svc = {};

    // different states
    svc.goToMap = function () {
      // For users who are on a phone, direct them to the gallery view instead of the map
      mobileService.isPhone() ? svc.goToGallery('world', 'discover') : $state.go('map');
    };

    svc.goToGallery = function (location, category, reload) {
      var r = reload || false;
      $state.go('gallery', {
        'location': location,
        'category': category
      }, {
        'reload': r
      });
    };

    svc.goToProfile = function (userId, reload) {
      var r = reload || false;
      $state.go('profile', {
        'userId': userId
      }, {
        'reload': r
      });
    };

    svc.goToSinglePhoto = function (photoId, reload) {
      var r = reload || false;
      $state.go('singlephoto', {
        'id': photoId
      }, {
        'reload': r
      });
    };

    // modals
    svc.goToUpload = function () {
      angular.element('#uploadModal').modal('show');
    };

    svc.goToSignup = function () {
      angular.element('#signupModal').modal('show');
    };

    svc.goToLogin = function () {
      angular.element('#loginModal').modal('show');
    };

    return svc;
  }]);