'use strict';

angular
  .module('wanderaweApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'angularFileUpload',
    'ngAnimate',
    'angularSpinner'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    // https://github.com/angular-ui/ui-router/issues/372
    $locationProvider.html5Mode(true).hashPrefix('!');

    // Used in 'map' state
    var _isPhone = function () {
      return window.innerWidth < 768;
    };

    var access = routingConfig.accessLevels;

    $urlRouterProvider
      .otherwise('/');

    $stateProvider
      .state('about', {
        url: '/about',
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        access: access.anon
      })
      .state('gallery', {
        url: '/gallery/:location/:category',
        templateUrl: 'views/gallery.html',
        controller: 'GalleryCtrl',
        resolve: {
          pictures: ['$rootScope','$stateParams', 'photoService', function ($rootScope, $stateParams, photoService) {
            /*
             * pictures will resolve into an array of photos based on the queryObj configurations
             */

            // When entering gallery state, update photoService.latestGalleryDetails
            var location = photoService.latestGalleryDetails.latestCountry = $stateParams.location; // 'world' or 'country_name'
            var category = photoService.latestGalleryDetails.latestCategory = $stateParams.category;

            var queryObj = {
              'country': null,
              'culture': false,
              'nature': false,
              'people': false
            };

            if (location !== 'world') {
              queryObj.country = location;
            }

            if (category !== 'discover') {
              queryObj[category] = true;
            }

            return photoService
              .retrieveAllPhotos(queryObj)
              .success(function (data) {
                return data;
              })
              .error(function (data) {
                $rootScope.$emit('message', data);
              });
          }]
        },
        access: access.anon
      })
      .state('map', {
        url: '/',
        templateUrl: !_isPhone() ? 'views/map.html' : 'views/map_mobile.html', // temporary solution to display map or redirect to gallery/world/discover
        controller: !_isPhone() ? 'MapCtrl' : 'MapmobileCtrl',
        access: access.anon
      })
      .state('profile', {
        url: '/profile/:userId',
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl',
        resolve: {
          pictures: ['$rootScope', '$stateParams', 'photoService', function ($rootScope, $stateParams, photoService) {
            /*
             * pictures will resolve into an array of photos based on the queryObj configurations
             */

            /* The code below is for potentially updating photoService.latestGalleryDetails
             * with a property to track who the last author visited was.
             */
             
            // var author = photoService.latestGalleryDetails.latestAuthor = $stateParams.userId; // 'world' or 'country_name'
            
            var queryObj = {
              'author': $stateParams.userId
              // 'author': author
            };

            return photoService
              .retrieveAllPhotos(queryObj)
              .success(function (data) {
                return data;
              })
              .error(function (data) {
                $rootScope.$emit('message', data);
              });
          }]
        },
        access: access.anon
      })
      .state('singlephoto', {
        url: '/singlephoto/:id',
        templateUrl: 'views/singlephoto.html',
        controller: 'SinglephotoCtrl',
        resolve: {
          notInjected: ['$rootScope', '$stateParams', 'photoService', function ($rootScope, $stateParams, photoService) {
            /* The purpose of notInjected is to retrieve the latest information from
             * retrieveAllPhotos and then find the index of the particular photo. With
             * this information, also update photoService.latestGalleryDetails
             */

            /* Whenever entering singlephoto state, always use the latest information from
             * photoService.latestGalleryDetails.
             */
            var location = photoService.latestGalleryDetails.latestCountry;
            var category = photoService.latestGalleryDetails.latestCategory;

            var queryObj = {
              'country': null,
              'culture': false,
              'nature': false,
              'people': false,
              'author': false
            };

            // For specific case when transitioning from profile to singlephoto
            if ($rootScope.currentState === 'profile') {
              queryObj.author = $rootScope.currentParams.userId;
              // console.log('queryObj in singlephoto resolve is:', queryObj);
              return photoService
                .retrieveAllPhotos(queryObj)
                .success(function (data) {
                  // console.log('data returned on success of singlephoto is:', data);
                  var index = _.findIndex(data, function (photo) {
                    return photo._id === $stateParams.id;
                  });

                  // even though using latestGalleryDetails, note that this is not from gallery state
                  photoService.latestGalleryDetails.currentIdx = (index === -1) ? 0 : index;
                  photoService.latestGalleryDetails.latestGalleryPhotos = data;
                })
                .error(function (data) {
                  $rootScope.$emit('message', data);
                });
            }

            // For specific case when using left and right buttons - i.e. transitioning from singlephoto to singlephoto view
            else if ($rootScope.currentState === 'singlephoto') {
              return;
            }

            else {
              // gallery state
              if (location !== 'world') {
                queryObj.country = location;
              }

              if (category !== 'discover') {
                queryObj[category] = true;
              }

              return photoService
                .retrieveAllPhotos(queryObj)
                .success(function (data) {
                  // Find specific index of singlephoto in data array
                  var index = _.findIndex(data, function(photo) {
                    return photo._id === $stateParams.id;
                  });

                  // If index not found, then user uploaded a photo from gallery state
                  // but decided to upload a photo with a different category and location
                  // from current gallery state.
                  photoService.latestGalleryDetails.currentIdx = (index === -1) ? 0 : index;
                  photoService.latestGalleryDetails.latestGalleryPhotos = data;
                })
                .error(function (data) {
                  $rootScope.$emit('message', data);
                });
            }
          }]
        },
        access: access.anon
      })
      .state('logout', {
        url: '/logout',
        templateUrl: 'views/logout.html',
        controller: 'LogoutCtrl',
        access: access.user
      });
  })
  .run(['$rootScope', '$cookieStore', '$window', 'userService', 'mobileService', 'messageService', 'navigationService', function ($rootScope, $cookieStore, $window, userService, mobileService, messageService, navigationService) {
    // Using $rootScope as a custom event bus
    $rootScope.$on('showSpinner', function () {
      $rootScope.uploadSpinner = true;
    });

    $rootScope.$on('hideSpinner', function () {
      $rootScope.uploadSpinner = false;
    });

    $rootScope.$on('message', function (e, args) {
      $window.alert(args);
    });

    // Using $rootScope to track of currentUser and currentUserName
    $rootScope.$on('$stateChangeStart', function (event, next) {
      var currentUser = $cookieStore.get('currentUser') || { username: '', role: routingConfig.userRoles.public };
      /*
       * Keep track of currentUser whenever a new state occurs
       * console.log('currentUser is', currentUser);
       */
      if (!userService.isAuthorized(next.access, currentUser.role)) {
        event.preventDefault();
        navigationService.goToMap();
      }

      $rootScope.currentUserName = userService.getCurrentUserName(); // undefined or string value
    });

    // Using $rootScope to track previous and current states, as well as any stateParams associated with those states
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      // Note: currentState is used to apply an orange or black background-color within index.html
      $rootScope.previousState = fromState.name;
      $rootScope.currentState = toState.name;
      $rootScope.previousParams = fromParams;
      $rootScope.currentParams = toParams;

      if ($rootScope.previousState === '') {
        $rootScope.previousState = 'map';
      }

      // Set up message to display to users in index.html after users log in
      // $rootScope.welcomeMessage = messageService.welcomeMessage();
      $rootScope.actualMessage = messageService.actualMessage();
    });

    // Using $rootScope to track whether the current screen size constitutes as a 'phone'
    $rootScope.isPhone = mobileService.isPhone();

    var closeToggle = function () {
      // This function adds functionality to the navbar toggle so that clicking on
      // items within the navbar will close the navbar instead of leaving it open.
      if (!mobileService.isDesktop()) {
        $('.nav a').on('click', function () { $('.navbar-toggle').click(); });
      } else {
        $('.nav a').off('click');
      }
    };

    closeToggle();

    angular.element($window).bind('resize', function () {
      $rootScope.isPhone = mobileService.isPhone();
      closeToggle();
    });
  }]);