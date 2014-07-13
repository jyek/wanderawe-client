'use strict';

angular.module('wanderaweApp')
  .factory('photoService', ['$rootScope', '$timeout', '$http', '$upload', '$state', '$window', 'userService', 'navigationService', function ($rootScope, $timeout, $http, $upload, $state, $window, userService, navigationService) {
    var svc = {};

    /* 
     * latestGalleryDetails contains information for transitions from gallery to
     * singlephoto, and from singlephoto to singlephoto
     */
    svc.latestGalleryDetails = {
      'currentIdx': 0,
      'latestCountry': 'world',
      'latestCategory': 'discover',
      'latestGalleryPhotos': []
      // 'latestAuthor': undefined
    };

    svc.autocompleteCountry = null;
    svc.slideFrom = 'slideInLeft';

    svc.showPhoto = function (photoObj) {
      return (photoObj.author === userService.getCurrentUserId());
    };

    svc.removePhoto = function (scope, photos, idx) {
      /* 
       * Don't need to check if user is logged in. Backend confirms right user is
       * logged in delete can happen.
       */

      var selectedPhoto = photos[idx]._id;
      var fileType = photos[idx].fileType;
      var currentParams = $rootScope.currentParams;
      var category = {};
      category.country = currentParams.country;
      category[currentParams.category] = true;

      $http
        .post('/delete', {
          'photoId': selectedPhoto,
          'fileType': fileType,
          'category': category
        })
        .success(function (data) {
          // expect to receive new array of photos again
          scope.pictures = data;
        })
        .error(function (data) {
          $rootScope.$emit('message', data);
        });
    };

    svc.likePhoto = function (scope, photos, idx) {
      var selectedPhoto = photos[idx]._id;

      $http
        .post('/vote', {
          'photoId': selectedPhoto
        })
        .success(function () {
          /*
           * Error here
           * console.log('success', data);
           * scope.vote = data;
           */

          console.log('likePhoto - success');
          // Temporary solution - hard reset to the current gallery page or current user's profile page
          if ($rootScope.currentState === 'gallery' || $rootScope.currentState === 'profile') {
            scope.pictures[idx].vote += 1;
          } else if ($rootScope.currentState === 'singlephoto') {
            // For updating the vote count in singlephoto state
            scope.currentPicture.vote += 1;
          }
        })
        .error(function (data) {
          console.log('likePhoto - error');
          if (data === '') {
            // Temporary solution - hard reset to the current gallery page or current user's profile page
            if ($rootScope.currentState === 'gallery' || $rootScope.currentState === 'profile') {
              scope.pictures[idx].vote += 1;
            } else if ($rootScope.currentState === 'singlephoto') {
              // For updating the vote count in singlephoto state
              scope.currentPicture.vote += 1;
            }
          } else {
            $rootScope.$emit('message', data);
          }
        });
    };

    svc.getPhotoCategory = function (photoObj) {
      if (photoObj.culture) {
        return 'culture';
      } else if (photoObj.nature) {
        return 'nature';
      } else {
        return 'people';
      }
    };

    svc.setSlideFrom = function(direction){
      svc.slideFrom = direction;
    };

    svc.getSlideFrom = function(){
      return svc.slideFrom;
    };

    svc.showNextPhoto = function (currentIdx, currentPhotos, totalNumPhotos) {
      var nextIdx = (currentIdx + 1) % totalNumPhotos;
      var nextPicture = currentPhotos[nextIdx];
      svc.latestGalleryDetails.currentIdx = nextIdx;
      navigationService.goToSinglePhoto(nextPicture._id);
    };

    svc.showPrevPhoto = function (currentIdx, currentPhotos, totalNumPhotos) {
      var prevIdx = (currentIdx + totalNumPhotos - 1) % totalNumPhotos;
      var prevPicture = currentPhotos[prevIdx];
      svc.latestGalleryDetails.currentIdx = prevIdx;
      navigationService.goToSinglePhoto(prevPicture._id);
    };

    svc.uploadPhoto = function (photoInfo, file) {
      $upload
        .upload({
          url: 'upload',
          data: photoInfo,
          file: file
        })
        .success(function (data) {
          // need reload here in case you're uploading from profile
          navigationService.goToProfile(data.author, true);
          angular.element('#uploadModal').modal('hide');
        })
        .error(function (msg) {
          $rootScope.$emit('message', msg);
          angular.element('#uploadModal').modal('hide');

          $timeout(function () {
            angular.element('#loginModal').modal('show');
          }, 1000);
        });
    };

    svc.retrieveOnePhoto = function (photoId) {
      return $http.post('/getOnePhoto', {'photoId': photoId});
    };

    svc.retrieveAllPhotos = function (queryObj) {
      return $http.post('/getPhotos', queryObj);
    };

    return svc;
  }]);
