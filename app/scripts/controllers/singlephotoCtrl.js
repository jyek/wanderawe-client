'use strict';

angular.module('wanderaweApp')
  .controller('SinglephotoCtrl', ['$rootScope', '$scope', '$window', '$location', '$state', 'resizeService', 'photoService', 'navigationService', function ($rootScope, $scope, $window, $location, $state, resizeService, photoService, navigationService) {
    // Initialization logic
    $scope.currentIdx     = photoService.latestGalleryDetails.currentIdx;
    $scope.currentPhotos  = photoService.latestGalleryDetails.latestGalleryPhotos; // array
    $scope.currentPicture = $scope.currentPhotos[$scope.currentIdx];
    $scope.totalNumPhotos = $scope.currentPhotos.length;
    $scope.photoPath      = $scope.currentPicture._id + '.' + $scope.currentPicture.fileType;
    $scope.slideEffect    = photoService.getSlideFrom();
    // $scope.wanderaweUrl   = $window.encodeURIComponent($location.absUrl());

    angular.element($window).bind('resize', function () {
      $scope.getFinalDimensions(photoService.latestGalleryDetails.currentIdx);
      $scope.$apply();
    });

    // Scope Methods
    $scope.showNextPhoto = function(currentIdx, currentPhotos, totalNumPhotos){
      photoService.setSlideFrom('slideInLeft');
      photoService.showNextPhoto(currentIdx, currentPhotos, totalNumPhotos);
    };

    $scope.showPrevPhoto = function(currentIdx, currentPhotos, totalNumPhotos){
      photoService.setSlideFrom('slideInRight');
      photoService.showPrevPhoto(currentIdx, currentPhotos, totalNumPhotos);
    };

    $scope.goBack = function () {
      navigationService.goToGallery(photoService.latestGalleryDetails.latestCountry, photoService.latestGalleryDetails.latestCategory);
    };

    $scope.goToProfile = navigationService.goToProfile;

    $scope.getFinalDimensions = function (currIdx) {
      // These are current height dimensions of navigation and footer on index.html
      var headerHeight = 100;
      var footerHeight = 75;
      var obj = resizeService.getFinalDimensions(photoService.latestGalleryDetails.latestGalleryPhotos[currIdx].height, photoService.latestGalleryDetails.latestGalleryPhotos[currIdx].width, $window.innerHeight - headerHeight - footerHeight, $window.innerWidth);
      $scope.finalWidth = obj.width;
      $scope.finalHeight = obj.height;
    };

    $scope.shareOnFacebook = function () {
      // https://developers.facebook.com/docs/sharing/reference/feed-dialog/v2.0
      $window.open('https://www.facebook.com/dialog/feed?app_id=648538671904741&display=popup&caption=by%20Altitude%20Labs&link=' + $location.absUrl() + '&picture=http://wanderawe.com/photos/' + $scope.currentPicture._id + '.jpeg&redirect_uri=http://wanderawe.com/singlephoto/' + $scope.currentPicture._id, 'facebook-share', 'width=626,height=436');
      return false;
    };

    $scope.likePhoto = function () {
      photoService.likePhoto($scope, $scope.currentPhotos, $scope.currentIdx);
    };
    
    $scope.getFinalDimensions($scope.currentIdx);
  }]);