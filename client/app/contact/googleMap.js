// http://stackoverflow.com/q/24246403/2726725
'use strict';

app.directive('googleMap', ['$rootScope', 'loadGoogleMapAPI', 
    function ($rootScope, loadGoogleMapAPI) {
        
        return {
            restrict: 'C', // restrict by class name
            scope: {
                mapId: '@id', // map ID
                lat: '@',     // latitude
                long: '@',     // longitude
                title: '@'      // address name (for tooltip on Marker)
            },
            link: function ($scope, elem, attrs) {
                
                // Check if latitude and longitude are specified
                if (angular.isDefined($scope.lat) && angular.isDefined($scope.long)) {
                    
                    // Initialize the map
                    $scope.initialize = function () {
                        $scope.location = new google.maps.LatLng($scope.lat, $scope.long);
                        
                        $scope.mapOptions = {
                            zoom: 16,
                            center: $scope.location
                                //mapTypeId: google.maps.MapTypeId.HYBRID
                        };
                        
                        $scope.map = new google.maps.Map(document.getElementById($scope.mapId), $scope.mapOptions);


                        var marker = new google.maps.Marker({ // jshint ignore:line
                            position: $scope.location,
                            map: $scope.map,
                            title: $scope.title
                        });
                    }
                    
                    // Loads google map script
                    loadGoogleMapAPI.then(function () {
                        // Promised resolved
                        $scope.initialize();
                    }, function () {
                        // Promise rejected
                    });
                }
            }
        };
    }]);


// Lazy loading of Google Map API
app.service('loadGoogleMapAPI', ['$window', '$q', 
    function ($window, $q) {
        
        var deferred = $q.defer();
        
        // Load Google map API script
        function loadScript() {
            // Use global document since Angular's $document is weak
            var script = document.createElement('script');
            script.src = '//maps.googleapis.com/maps/api/js?sensor=false&language=en&callback=initMap';
            
            document.body.appendChild(script);
        }
        
        // Script loaded callback, send resolve
        $window.initMap = function () {
            deferred.resolve();
        }
        
        loadScript();
        
        return deferred.promise;
    }]);