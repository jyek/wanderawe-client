'use strict';

angular.module('wanderaweApp')
  .controller('LoginCtrl', ['$rootScope', '$scope', '$http', '$cookieStore', function ($rootScope, $scope, $http, $cookieStore) {
    // Initialization logic
    $scope.displayLocalLogin = false;
    $scope.signin = {
      'email': '',
      'password': ''
    };

    angular.element('#loginModal').on('hidden.bs.modal', function () {
      $scope.resetForm();
    });

    // Scope Methods
    $scope.resetForm = function () {
      $scope.displayLocalLogin = false;
      $scope.signin.email = '';
      $scope.signin.password = '';
    };

    $scope.toggleLocalLogin = function () {
      $scope.displayLocalLogin = !$scope.displayLocalLogin;
    };

    $scope.goToLocalLogin = function (valid) {
      if (!valid) {
        // reset the email and password
        $scope.signin.email = '';
        $scope.signin.password = '';
      } else {
        $http
          .post('/auth/local', $scope.signin)
          .success(function (data) {
            $cookieStore.put('currentUser', data);
            
            // NavigationCtrl is listening for signedIn and then redirecting to map view
            $rootScope.$broadcast('signedIn');
            angular.element('#loginModal').modal('hide');
          })
          .error(function (data) {
            // reset the email and password
            $scope.signin.email = '';
            $scope.signin.password = '';
            $scope.$emit('message', data);
          });
      }
    };
  }]);