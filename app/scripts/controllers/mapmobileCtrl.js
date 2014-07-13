'use strict';

angular.module('wanderaweApp')
  .controller('MapmobileCtrl', ['navigationService', function (navigationService) {
    // This controller is simply a redirect to /gallery/world/discover and should only apply
    // when screen size is less than 'phone' size
    navigationService.goToGallery('world', 'discover');
  }]);