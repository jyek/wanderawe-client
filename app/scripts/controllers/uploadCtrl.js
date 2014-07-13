'use strict';

angular.module('wanderaweApp')
  .controller('UploadCtrl', ['$scope', 'photoService', 'month', 'year', 'category', 'userService', function ($scope, photoService, month, year, category, userService) {
    // Initialization logic
    $scope.photoInfo = {
      'culture': false,
      'nature': false,
      'people': false
    };
    $scope.months = month;
    $scope.years = year;
    $scope.categories = category;

    angular.element('#uploadModal').on('hidden.bs.modal', function () {
      $scope.resetForm();
      
      // Reset photo uploaded
      $scope.file = undefined;

      $scope.$emit('hideSpinner');
    });

    // Scope Methods
    $scope.submitForm = function (isValid) {
      var fileSelected = $scope.file !== void 0;
      if (!fileSelected) {
        $scope.$emit('message', 'Please select a photo to upload.');
        return;
      }

      if (isValid) {
        if (photoService.autocompleteCountry === null) {
          $scope.$emit('message', 'Please select a location from the Autocomplete options.');
          return;
        }

        // Pass in selected category and selected country
        $scope.photoInfo[$scope.selectedCategory] = true;
        $scope.photoInfo.country = photoService.autocompleteCountry;

        // Pass fullAddress' value from google autocomplete form to backend
        $scope.photoInfo.fullAddress = $('#Autocomplete').val();
        
        $scope.photoInfo.username = userService.getCurrentUserName();

        // Since image can take a while to load, show a spinner
        $scope.$emit('showSpinner');
        photoService.uploadPhoto($scope.photoInfo, $scope.file);
        $scope.resetForm();
      }
    };

    $scope.resetForm = function () {
      $scope.photoInfo = {
        'culture': false,
        'nature': false,
        'people': false,
        'title': undefined,
        'description': undefined,
        'fullAddress': undefined
      };
      
      $scope.months = month;
      $scope.years = year;
      $scope.categories = category;
      $scope.selectedCategory = undefined;
      $scope.selectedCountry = undefined;
      photoService.autocompleteCountry = null;
      
      // Reset file uploaded
      angular.element('#file-upload-field').replaceWith(angular.element('#file-upload-field').clone(true));

      $scope.userForm.$setPristine();
    };

    $scope.onFileSelect = function($files) {
      $scope.file = $files[0];

      // http://stackoverflow.com/questions/12570834/how-to-preview-image-get-file-size-image-height-and-width-before-upload?lq=1
      var reader = new FileReader();
      var image = new Image();

      reader.readAsDataURL($scope.file);
      reader.onload = function (_file) {
        image.src = _file.target.result;
        image.onload = function () {
          // adding width and height manually
          $scope.photoInfo.width = this.width;
          $scope.photoInfo.height = this.height;
        };
      };
    };
  }]);
