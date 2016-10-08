(function(angular){
angular.module('myApp', ['ngRoute','leaflet-directive'])
.config(['$routeProvider', function ($routeProvider) {
		$routeProvider
		.when("/",{
			templateUrl:"/static/partials/profile-adventures.html",
			controller:"advController"
		})
		.when("/:advId/maps",{
			templateUrl:"/static/partials/profile-maps.html",
			controller:"mapsController"
		})
		.when("/:advId/blogs",{
			templateUrl:"/static/partials/profile-blogs.html",
			controller:"blogsController"
		})
		.when("/:advId/gear",{
			templateUrl:"/static/partials/profile-gear.html",
			controller:"gearController"
		});	
}])
.controller('mainController',['$scope','$log','$http',function($scope,$log,$http){
    //get adventure lists
    $scope.userId = document.getElementById("userId").value;
    //TODO check proper way of handling rest                                                                                                                         
    $http.get('/api/rest/userInfo/' + $scope.userId).then(function(data){
        $scope.adventures = data.data;
        $scope.currentAdvId = $scope.adventures[0].id;
        $scope.currentAdvName = $scope.adventures[0].name;
    });
}])
.controller('advController',['$scope','$log','$http','leafletData',function($scope,$log,$http,leafletData){
    //Check if user has adventures
    //if he doesn't, show message.

    $scope.advsOverviewData = null;
    
    var mapboxToken = document.getElementById("mapboxToken").value;
    var mapboxMapName = document.getElementById("mapboxMap").value;

    var tileLayers = {
	mapbox1 : {
	    name: "Mapbox Custom",
	    type: "xyz",
	    url :  'http://api.tiles.mapbox.com/v4/'+mapboxMapName+'/{z}/{x}/{y}.png?access_token='+mapboxToken,
	    layerOptions: {
		continuousWorld:true
	    }
	},
	mapbox2 : {
	    name: "Mapbox Streets",
	    type: "xyz",
	    url : 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token='+ mapboxToken,
	    layerOptions: {
		continuousWorld:true
	    }
	},
	mapbox3:{
	    name: "Mapbox Outdoors",
	    type: "xyz",
	    url : 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=' + mapboxToken,
	    layerOptions: {
		continuousWorld:true
	    }
	}
    };
    
    //init map
    angular.extend($scope, {
	center: {
	    lat: 45.510,
	    lng: -122.4832,
	    zoom: 10
	},
	layers: {
	    baselayers: tileLayers
	},

	geojson: {}
    });


    
    leafletData.getMap().then(function(map){
	advsOverviewLayer = new L.geoJson();
	advsOverviewLayer.addTo(map);
    });

    function fitMap(bounds){
	leafletData.getMap().then(function(map){
	    map.fitBounds(bounds);
	});
    };
    
    //Gotta get advOverview map....
    $http.get('/api/rest/advsOverview/'+ $scope.userId).then(function(data){
	$scope.advsOverviewData = data.data;
	advsOverviewLayer.addData($scope.advsOverviewData);

	fitMap(advsOverviewLayer.getBounds())
    });
    //if there are maps worth visualizing
    //init map

}])
.controller('mapsController',['$scope','$log','$routeParams',function($scope,$log,$routeParams){
	var currentAdvFromUrl  = $routeParams.advId;
	$log.log("Current adv from url: "+ currentAdvFromUrl);
}])
.controller('blogsController',['$scope','$log',function($scope,$log){
	$log.log("Hello from blogs controller");
}])
.controller('gearController',['$scope','$log',function($scope,$log){
	$log.log("Hello from gear controller");
}]);
})(window.angular);
