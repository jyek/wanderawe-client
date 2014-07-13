'use strict';

/**
 * A directive for adding google places autocomplete to a text box
 * google places autocomplete info: https://developers.google.com/maps/documentation/javascript/places
 *
 * Usage:
 *
 * <input type="text"  ng-autocomplete ng-model="autocomplete" options="options" details="details/>
 *
 * + ng-model - autocomplete textbox value
 *
 * + details - more detailed autocomplete result, includes address parts, latlng, etc. (Optional)
 *
 * + options - configuration for the autocomplete (Optional)
 *
 *       + types: type,        String, values can be 'geocode', 'establishment', '(regions)', or '(cities)'
 *       + bounds: bounds,     Google maps LatLngBounds Object, biases results to bounds, but may return results outside these bounds
 *       + country: country    String, ISO 3166-1 Alpha-2 compatible country code. examples; 'ca', 'us', 'gb'
 *       + watchEnter:         Boolean, true; on Enter select top autocomplete result. false(default); enter ends autocomplete
 *
 * example:
 *
 *    options = {
 *        types: '(cities)',
 *        country: 'ca'
 *    }
**/

angular.module('wanderaweApp')
  .directive('ngAutocomplete', ['photoService', function (photoService) {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '=',
        options: '=?',
        details: '=?'
      },

      link: function(scope, element, attrs, controller) {

        //options for autocomplete
        var opts;
        var watchEnter = false;
        //convert options provided to opts
        var initOpts = function() {

          opts = {};
          if (scope.options) {

            if (scope.options.watchEnter !== true) {
              watchEnter = false;
            } else {
              watchEnter = true;
            }

            if (scope.options.types) {
              opts.types = [];
              opts.types.push(scope.options.types);
              scope.gPlace.setTypes(opts.types);
            } else {
              scope.gPlace.setTypes([]);
            }

            if (scope.options.bounds) {
              opts.bounds = scope.options.bounds;
              scope.gPlace.setBounds(opts.bounds);
            } else {
              scope.gPlace.setBounds(null);
            }

            if (scope.options.country) {
              opts.componentRestrictions = {
                country: scope.options.country
              };
              scope.gPlace.setComponentRestrictions(opts.componentRestrictions);
            } else {
              scope.gPlace.setComponentRestrictions(null);
            }
          }
        };

        if (scope.gPlace == undefined) {
          /* custom code - adding restriction to region, which limits the google
           * api outputs to higher level places
           * -> https://developers.google.com/places/documentation/autocomplete
           */
          var options = {
            // types: ['(regions)']
            // componentRestrictions: {country: "us"}
          };
          scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
        }
        google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
          var result = scope.gPlace.getPlace();
          if (result !== undefined) {
            if (result.address_components !== undefined) {

              /* custom code */
              var country;
              var components = result.address_components;
              var componentsLen = components.length;

              // go through each element of components (each object is a component)
                // for each object, check the types property of the object (which is an array)
                // and iterate through the array to see if any of the values is 'country'
                  // if yes, then return the initial object's long name property
              outer:
              for (var i = componentsLen - 1; i >= 0; i -= 1) {
                var addressObj = components[i];
                for (var j = 0; j < addressObj.types.length; j += 1) {
                  if (addressObj.types[j] === 'country') {
                    country = components[i].long_name;
                    break outer;
                  }
                }
              }
              /* end of custom code */

              scope.$apply(function() {
                scope.details = result;
                
                // custom code: put country in photoService
                photoService.autocompleteCountry = country;

                controller.$setViewValue(element.val());
              });
            }
            else {
              if (watchEnter) {
                getPlace(result);
              }
            }
          }
        });

        //function to get retrieve the autocompletes first result using the AutocompleteService 
        var getPlace = function(result) {
          var autocompleteService = new google.maps.places.AutocompleteService();
          if (result.name.length > 0){
            autocompleteService.getPlacePredictions(
              {
                input: result.name,
                offset: result.name.length
              },
              function listentoresult(list, status) {
                if(list == null || list.length == 0) {

                  scope.$apply(function() {
                    scope.details = null;
                  });

                } else {
                  var placesService = new google.maps.places.PlacesService(element[0]);
                  placesService.getDetails(
                    {'reference': list[0].reference},
                    function detailsresult(detailsResult, placesServiceStatus) {

                      if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                        scope.$apply(function() {

                          controller.$setViewValue(detailsResult.formatted_address);
                          element.val(detailsResult.formatted_address);

                          scope.details = detailsResult;
                          // console.log('scope.details', scope.details);

                          //on focusout the value reverts, need to set it again.
                          var watchFocusOut = element.on('focusout', function(event) {
                            element.val(detailsResult.formatted_address);
                            element.unbind('focusout');
                          });

                        });
                      }
                    }
                  );
                }
              });
          }
        };

        controller.$render = function () {
          var location = controller.$viewValue;
          element.val(location);
        };

        //watch options provided to directive
        scope.watchOptions = function () {
          return scope.options;
        };
        scope.$watch(scope.watchOptions, function () {
          initOpts();
        }, true);

      }
    };
  }]);