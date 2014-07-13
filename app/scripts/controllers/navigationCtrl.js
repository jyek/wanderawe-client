'use strict';

angular.module('wanderaweApp')
  .controller('NavigationCtrl', ['$rootScope', '$scope', '$state', 'userService', '$cookieStore', 'mobileService', 'navigationService', function ($rootScope, $scope, $state, userService, $cookieStore, mobileService, navigationService) {
    // Local login is the only process that triggers this event
    $scope.$on('signedIn', function () {
      $scope.isSignedIn = userService.isLoggedIn($cookieStore.get('currentUser'));
      $scope.username = userService.getCurrentUserName();
      $scope.goToProfile();
    });

    $scope.$on('loggedOut', function () {
      $scope.isSignedIn = userService.isLoggedIn($cookieStore.get('currentUser'));
      $scope.username = userService.getCurrentUserName();
      $scope.goToLogo();
    });

    // Initialization logic - this line must exist in order for Facebook and Twitter authentication
    // to show user actually being logged in
    $scope.isSignedIn = userService.isLoggedIn($cookieStore.get('currentUser'));
    $scope.username = userService.getCurrentUserName();

    // Scope Methods
    $scope.sendNavigationInfo = function (category) {
      var location = ($rootScope.currentState === 'gallery') ? $rootScope.currentParams.location : 'world';
      navigationService.goToGallery(location, category);
    };

    $scope.goToLogo = navigationService.goToMap;
    $scope.goToUpload = navigationService.goToUpload;
    $scope.goToSignup = navigationService.goToSignup;
    $scope.goToLogin = navigationService.goToLogin;

    $scope.goToProfile = function () {
      navigationService.goToProfile(userService.getCurrentUserId());
    };

    
  }]);
