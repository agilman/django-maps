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
    $scope.currentPage = 'advs';
    $scope.adventures = null;
    $scope.currentAdvId = null;
    $scope.currentAdvName = null;
    $scope.currentAdvIndex= null;
    
    //TODO check proper way of handling rest
    $http.get('/api/rest/userInfo/' + $scope.userId).then(function(data){
	$scope.adventures = data.data;
	$scope.currentAdvId = $scope.adventures[$scope.adventures.length-1].id;
	$scope.currentAdvName = $scope.adventures[$scope.adventures.length-1].name;
	$scope.currentAdvIndex = $scope.adventures.length-1;
    });

    $scope.isAdvPageActive = function(){
	if($scope.currentPage == 'advs'){
	    return "active";
	}
    };

    $scope.isMapPageActive = function(){
	if($scope.currentPage == 'maps'){
	    return "active";
	}
    };

    $scope.isBlogPageActive = function(){
	if($scope.currentPage == 'blogs'){
	    return "active";
	}
    };

    $scope.isGearPageActive = function(){
	if($scope.currentPage == 'gear'){
	    return "active";
	}
    };
    
    $scope.$on('setAdvPageActive',function(event){
	$scope.currentPage='advs';
    });

    $scope.$on('setMapPageActive',function(event){
	$scope.currentPage='maps';
    });

    $scope.$on('setBlogPageActive',function(event){
	$scope.currentPage='blogs';
    });

    $scope.$on('setGearPageActive',function(event){
	$scope.currentPage='gear';
    });

    $scope.$on('advChangeEvent',function(event,index){
	$scope.currentAdvName = $scope.adventures[index].name;
	$scope.currentAdvIndex = index;
    });
}])
.controller('advController',['$scope','$log','$http','leafletData',function($scope,$log,$http,leafletData){
    $scope.$emit("setAdvPageActive");
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
	
	segmentHighlightLayer = new L.LayerGroup();
	segmentHighlightLayer.addTo(map);
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

    $scope.getAdvDistance = function(index){
	if ($scope.advsOverviewData != null){
	    return $scope.advsOverviewData.features[index].properties.distance/1000;
	}
    };

    $scope.mouseOnAdv = function(index){
	var coordinates = $scope.advsOverviewData.features[index].geometry.coordinates;
	drawSegmentHighlight(coordinates);
    };

    $scope.mouseleaveAdv = function(index){
	segmentHighlightLayer.clearLayers();
    };

    $scope.isAdvSelected = function(index){
	if ($scope.currentAdvIndex == index){
	    return "active";
	}
    };
    $scope.advSelectClick = function(index){
	if($scope.currentAdvIndex==index){
	    var segmentGeoJson= new L.geoJson(segmentHighlightLayer.toGeoJSON());
	    fitMap(segmentGeoJson.getBounds());
	}else{
	    $scope.$emit("advChangeEvent",index);
	}
    };
}])
.controller('mapsController',['$scope','$log','$routeParams',function($scope,$log,$routeParams){
    $scope.$emit("setMapPageActive");
}])
.controller('blogsController',['$scope','$log',function($scope,$log){
    $scope.$emit("setBlogPageActive");
}])
.controller('gearController',['$scope','$log',function($scope,$log){
    $scope.$emit("setGearPageActive");
}]);
})(window.angular);
