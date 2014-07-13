'use strict';

angular.module('wanderaweApp')
  .controller('MapCtrl', ['$scope', '$window', 'photoService', 'navigationService', function ($scope, $window, photoService, navigationService) {

    d3.select($window).on('resize', throttle);

    var zoom = d3.behavior.zoom()
      .scaleExtent([1, 9])
      .on('zoom', move);

    var height = window.innerHeight;
    var width = window.innerWidth;

    var topo,
        projection,
        path,
        svg,
        g;

    var graticule = d3.geo.graticule();

    var tooltip = d3.select('#container').append('div')
      .attr('class', 'tooltip');

    setup(width,height);

    function setup(width,height){

      var s = width > 969 ? width / 2 / Math.PI : width / 2 / Math.PI;
      var t = [(width/2.2), width > 969 ? height/1.5 : height/2];

      projection = d3.geo.mercator()
        .scale(s)
        .translate(t);

      path = d3.geo.path().projection(projection);

      svg = d3.select('#container').append('svg')
          .attr('width', width)
          .attr('height', height)
          .call(zoom)
          .on('click', click)
          .append('g');

      g = svg.append('g');
    }

    d3.json('../map_data/world-topo-min.json', function(error, world) {
      var countries = topojson.feature(world, world.objects.countries).features;
      topo = countries;
      draw(topo);
    });

   /* Custom code here */
    var clickOnPathElement = function ($pathElement) {
      var countryName = $pathElement.attr('title');
      $pathElement.on('click', function () {
        navigationService.goToGallery(countryName, 'discover');
      });
    };
    /*******************/

    function draw(topo) {
      svg.append('path')
         .datum(graticule)
         .attr('class', 'graticule')
         .attr('d', path);

      g.append('path')
       .datum({type: 'LineString', coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
       .attr('class', 'equator')
       .attr('d', path);

      var country = g.selectAll('.country').data(topo);

      country.enter().insert('path')
          .attr('class', 'country')
          .attr('d', path)
          .attr('id', function(d,i) { return d.id; })
          .attr('title', function(d,i) { return d.properties.name; });
          // .style('fill', function(d, i) { return d.properties.color; });


      /* Custom code here */
      var $path;
      for (var i = 0; i < country[0].length; i += 1) {
        $path = $(country[0][i]);
        clickOnPathElement($path);
      }
      /*******************/

      var photoByCountryCache = {};
      $scope.getNumberOfPhotos = function (country, fn) {
        if (photoByCountryCache[country]) {
          fn(photoByCountryCache[country]);
        } else {
          return photoService
            .retrieveAllPhotos({
              'country': country
            })
            .success(function (data) {
              // save in cache for later reference
              var numPhotos = data.length;
              photoByCountryCache[country] = numPhotos;

              fn(numPhotos);
            })
            .error(function (data) {
              $scope.$emit('message', data);
            });
        }
      };

      //offsets for tooltips
      var offsetL = document.getElementById('container').offsetLeft+20;
      var offsetT = document.getElementById('container').offsetTop+10;

      //tooltips
      country
        .on('mousemove', function(d,i) {
          var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

          /* custom code here */
          $scope.getNumberOfPhotos(d.properties.name, function (num) {
            tooltip
              .html(d.properties.name + ' (' + num + ' photos)')
              .attr('class', 'tooltip')
              .attr('style', 'display: block;');
          });
          /*******************/
        })
        .on('mouseout', function(d,i) {
          tooltip.attr('style', 'display: none');
        });
    }

    function redraw() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      d3.select('svg').remove();
      setup(width,height);
      draw(topo);
    }

    function move() {
      var t = d3.event.translate;
      var s = d3.event.scale;
      var zscale = s;
      var h = height/4;

      t[0] = Math.min(
        (width/height)  * (s - 1),
        Math.max( width * (1 - s), t[0] )
      );

      t[1] = Math.min(
        h * (s - 1) + h * s,
        Math.max(height  * (1 - s) - h * s, t[1])
      );

      zoom.translate(t);
      g.attr('transform', 'translate(' + t + ')scale(' + s + ')');

      // adjust the country hover stroke width based on zoom level
      d3.selectAll('.country').style('stroke-width', 1/s);
    }

    var throttleTimer;
    function throttle() {
      $window.clearTimeout(throttleTimer);
        throttleTimer = $window.setTimeout(function() {
          redraw();
        }, 50);
    }

    //geo translation on mouse click in map
    function click() {
      var latlon = projection.invert(d3.mouse(this));
      // console.log(latlon);
    }

    //function to add points and text to the map (used in plotting capitals)
    function addpoint(lat,lon,text) {
      var gpoint = g.append('g').attr('class', 'gpoint');
      var x = projection([lat,lon])[0];
      var y = projection([lat,lon])[1];

      gpoint.append('svg:circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('class','point')
            .attr('r', 1.5);

      //conditional in case a point has no associated text
      if(text.length>0){
        gpoint.append('text')
              .attr('x', x+2)
              .attr('y', y+2)
              .attr('class','text')
              .text(text);
      }
    }
  }]);
