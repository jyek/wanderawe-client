'use strict';

angular.module('wanderaweApp')
  .controller('SignupCtrl', ['$scope', '$http', function ($scope, $http) {
    // Initialization logic
    $scope.signup = {
      'username':'',
      'email': '',
      'password': ''
    };

    angular.element('#signupModal').on('hidden.bs.modal', function () {
      $scope.resetForm();
    });

    // Scope Methods
    $scope.resetForm = function () {
      $scope.signup.username = '';
      $scope.signup.email = '';
      $scope.signup.password = '';
      $scope.signupForm.$setPristine();
    };

    $scope.submitForm = function (valid) {
      if (valid) {
        $http
          .post('/signup', $scope.signup)
          .success(function (data) {
            var message = 'Welcome to Wanderawe, ' + data.local.username + '! Please go ahead and login.';
            $scope.$emit('message', message);

            angular.element('#signupModal').modal('hide'); // on close, will automatically go to 'map'
          })
          .error(function () {
            $scope.$emit('message', 'Username or Email already exists. Please try again.');
            $scope.resetForm();
          });
      }
    };
  }]);