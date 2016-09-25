(function(angular){
angular.module('myApp', ['ngRoute','ui.bootstrap.datetimepicker','leaflet-directive'])
.config(['$routeProvider', function ($routeProvider) {
		$routeProvider
		.when("/",{
			templateUrl:"/static/partials/editor-adventures.html",
			controller:"advEditorController"
		})
		.when("/:advId/maps",{
			templateUrl:"/static/partials/editor-maps.html",
			controller:"mapsEditorController",
		})
		.when("/:advId/blogs",{
			templateUrl:"/static/partials/editor-blogs.html",
			controller:"advEditorController"
		})
		.when("/:advId/gear", {
			templateUrl: "/static/partials/editor-gear.html",
			controller: "advEditorController"
		});
}])
.controller("mainController",['$scope','$http','$log',function($scope,$http,$log){
    var userId = document.getElementById("userId").value;
    $scope.userId = userId;
    
    $http.get('/api/rest/userInfo/' + userId).then(function(data){
    	$scope.adventures = data.data;
    	//Get latest adv if adventureId not provided...
    	$scope.currentAdvId  =  $scope.adventures[0].id;
    	$scope.currentAdvName= $scope.adventures[0].name;
    });

    $scope.$on('advChangeEvent',function(event,data){
	$scope.currentAdvId  =  $scope.adventures[data].id;
    	$scope.currentAdvName= $scope.adventures[data].name;
    });
}])
.controller("mapsEditorController",['$scope','$http','$log','$routeParams','leafletData',function($scope,$http,$log, $routeParams,leafletData){
    //init map
    var token = document.getElementById("mapboxToken").value;
    var mapboxMapName = document.getElementById("mapboxMap").value;
    
    angular.extend($scope, {
        center: {
            lat: 45.510,
            lng: -122.4832,
            zoom: 10
        },
        tiles: {
            url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
            type: 'xyz',
            options: {
                apikey: token,
                mapid: mapboxMapName
            }
        },
        geojson: {}
    });
	
    leafletData.getMap().then(function(map){
    	startLayer = new L.LayerGroup();
    	startLayer.addTo(map);
    });
    
    var urlAdvId  = $routeParams.advId;
    
    $http.get('/api/rest/advMaps/' + urlAdvId).then(function(data){
    	$scope.maps = data.data;
    	
    	if($scope.maps.length>0){
    	    $scope.currentMapId  =  $scope.maps[0].id;
    	    $scope.currentMapName= $scope.maps[0].name;
    	}
    });
    
    $scope.$on("leafletDirectiveMap.click",function(e,wrap){
    	$scope.startSet = "red";
    	var lat = wrap.leafletEvent.latlng.lat;
    	var lng = wrap.leafletEvent.latlng.lng;
    	
        //erase previous circle
        startLayer.clearLayers();

        //draw circle
        var circleOptions = {'color':'#FB0C00'}
        var newLatLng = new L.latLng(lat,lng);
        var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(3);    
        
        marker.addTo(startLayer);
    });
    
    $scope.createMap = function(){
    	var mapName = document.getElementById("newMapName").value;
    	//prepare json to pass
    	var newMap = {'advId':$scope.currentAdvId,'name':mapName};
    	$http.post('/api/rest/advMaps/'+$scope.currentAdvId,JSON.stringify(newMap)).then(function(data){
    		$scope.maps.push(data.data);
    		//clear field
    		document.getElementById("newMapName").value="";
    	})
    };

    $scope.createSegment = function(){
	$log.log($scope.dateRangeStart);
    };
    
    
    $scope.deleteMap = function(index){
    	var mapId = $scope.maps[index].id;
    	$http.delete('/api/rest/maps/'+mapId).then(function(resp){
    		//clear entry from list
    		$scope.maps.splice(index,1);
    	});
    };
    
}])
.controller("advEditorController",['$scope','$http','$log',function($scope,$http,$log){
    $scope.profilePic = "/static/img/blank-profile-picture.png";

    $scope.createAdv = function(){
	var advName = document.getElementById("newAdvName").value;
	//prepare json to pass                                                                                                                                       
        var newAdv = {'owner':$scope.userId,'name':advName};
	
        $http.post('/api/rest/adventures',JSON.stringify(newAdv)).then(function(data){
            $scope.adventures.push(data.data);
            
            //clear field
            document.getElementById("newAdvName").value="";
        })
    };
    
    $scope.deleteAdv = function(index){
	var advId = $scope.adventures[index].id;
    	$http.delete('/api/rest/adventures/'+advId).then(function(resp){
    		//clear entry from list
    		$scope.adventures.splice(index,1);
    	});
    };

    $scope.advClick = function(index){
	$scope.$emit('advChangeEvent',index);
    };

}]);
})(window.angular);
