'use strict';

angular.module('wanderaweApp')
  .controller('GalleryCtrl', ['$scope', '$state', '$window', 'pictures', 'photoService', 'userService', 'resizeService', 'messageService', 'navigationService', function ($scope, $state, $window, pictures, photoService, userService, resizeService, messageService, navigationService) {
    /* Initialization logic
     * 1) Setting up event handlers to show and hide spinner
     * 2) Setting up message when there are no photos
     * 3) Setting all thumbnails to have height and width of 400px
     * 4) Dealing with anomaly when no pictures are coming back from 'pictures'
     */

    // Spinner logic
    $scope.$emit('showSpinner');
    $('.gallery-container').waitForImages(function () {
      $scope.$emit('hideSpinner');
    });

    // Message logic
    $scope.currentCategory = messageService.capitalize($state.params.category);
    $scope.currentLocation = _.map($state.params.location.split(' '), function (str) { return messageService.capitalize(str); }).join(' ');
    $scope.currentUserName = _.map(userService.getCurrentUserName().split(' '), function (str) { return messageService.capitalize(str); }).join(' ');
    $scope.message = $scope.currentUserName + ', why';

    var thumbWidth = 400;
    $scope.height = thumbWidth;
    $scope.width = thumbWidth;
    $scope.windowWidth = $window.innerWidth;
    $scope.position = [];
    // When result from 'pictures' is empty, pictures.data array looks like [null]
    $scope.pictures = (pictures.data.length === 1 && pictures.data[0] === null) ? [] : pictures.data;

    // Scope Methods
    $scope.showPhoto = photoService.showPhoto;
    $scope.getPhotoCategory = photoService.getPhotoCategory;

    $scope.removePhoto = function (idx) {
      photoService.removePhoto($scope, $scope.pictures, idx);
    };

    $scope.likePhoto = function (idx) {
      photoService.likePhoto($scope, $scope.pictures, idx);
    };

    $scope.goToSinglePhoto = function (idx) {
      var photo = $scope.pictures[idx];
      photoService.latestGalleryDetails.currentIdx = idx;
      photoService.latestGalleryDetails.latestGalleryPhotos = $scope.pictures;
      navigationService.goToSinglePhoto(photo._id);
    };

    $scope.goToCountry = function (country) {
      navigationService.goToGallery(country, 'discover');
    };

    $scope.goToProfile = navigationService.goToProfile;

    /*
     * The purpose of lazyResize is to prevent the window's resize event from constantly firing.
     * Instead, wait 200ms after the last resize event fires to execute the lazyResize function.
     */
    var lazyResize = _.debounce(function () {
      $scope.height = $scope.width = resizeService.getSize(thumbWidth);
      $scope.isotope();
    }, 200);

    $scope.isotope = function (){
      $scope.position = [];
      var photoSize = resizeService.getSize(thumbWidth);
      var totalPhotos = $scope.pictures.length;
      var photosPerRow = Math.ceil( $window.innerWidth / thumbWidth );

      for (var i = 0; i < totalPhotos; i += 1) {
        var x = (i % photosPerRow) * photoSize;
        var y = Math.floor(i / photosPerRow) * photoSize;
        var position = { left: x, top: y };
        $scope.position.push(position);
      }
      
      $scope.windowWidth = photoSize * photosPerRow;
      $scope.$apply();
    };

    angular.element($window).bind('resize', lazyResize);
    lazyResize();
  }]);
