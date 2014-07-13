'use strict';

angular.module('wanderaweApp')
  .controller('LogoutCtrl', ['$rootScope', '$scope', '$http', '$cookieStore', function ($rootScope, $scope, $http, $cookieStore) {
    
    $scope.logOut = function () {
      $http
        .post('/logout', {})
        .success(function (data) {
          $cookieStore.remove('currentUser');
          // NavigationCtrl is listening for loggedOut event
          $rootScope.$broadcast('loggedOut');
        })
        .error(function (data) {
          console.log('error in LogoutCtrl', data);
        });
    };

    $scope.logOut();
  }]);
