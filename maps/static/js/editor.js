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
    //set map based on url...
    var urlAdvId  = $routeParams.advId;
    
    //emit... if needed.
    $scope.currentAdvId=urlAdvId;
    
    $scope.startSet = false;
    startLat = null;
    startLng = null;
    startDatetime = null;
    $scope.startTime = null;
    $scope.endtTime = null;
    
    $scope.endSet = false;
    endLat = null;
    endLng = null;
    finishDatetime = null;

    $scope.currentMapId= null;
    $scope.currentMapName=null;
    //Load maps, and latest segments
    $http.get('/api/rest/advMaps/' + urlAdvId).then(function(data){
    	$scope.maps = data.data;
    	
    	if($scope.maps.length>0){
    	    $scope.currentMapId  =  $scope.maps[0].id;
    	    $scope.currentMapName= $scope.maps[0].name;
    	        
    	    //get Map
    	    $http.get('/api/rest/maps/' + $scope.currentMapId).then(function(data){
    	    	geoJsonLayer.addData(data.data);
    	    	
    	    	//set startPoint to last point from established line...
    	    	if (data.data.features.length>0){
    	    		var lastSegment = data.data.features[data.data.features.length-1].geometry.coordinates;
    	    		
    	    		if (lastSegment.length>0){
    	    			startLat = lastSegment[lastSegment.length-1][1];
    	    			startLng = lastSegment[lastSegment.length-1][0];

    	    			setStartPoint(startLat,startLng);
    	    			$scope.startSet = true;
    	    		}
    	    	}
    	    });
    	}
    });
    
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
	
    //after leaflet loads, create layers
    leafletData.getMap().then(function(map){
    	startLayer = new L.LayerGroup();
    	startLayer.addTo(map);
    	
    	endLayer = new L.LayerGroup();
    	endLayer.addTo(map);

    	latestPathLayer = new L.LayerGroup();
    	latestPathLayer.addTo(map);
    	
    	geoJsonLayer = new L.geoJson();
    	geoJsonLayer.addTo(map);
    });
    
    // map click
    $scope.$on("leafletDirectiveMap.click",function(e,wrap){
    	var lat = wrap.leafletEvent.latlng.lat;
    	var lng = wrap.leafletEvent.latlng.lng;
    	
    	//set start point.
    	if (!$scope.startSet){
    		setStartPoint(lat,lng);
    	    $scope.startSet = true;
    	}else{
    		setEndPoint(lat,lng);	    
    		$scope.endSet = true;
    		}
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
	
    	var wp = [[startLat,startLng],[endLat,endLng]];
    	var newSegment = {'mapId':$scope.currentMapId,
			  'startTime':$scope.dateRangeStart,
			  'endTime': $scope.dateRangeEnd,
			  'distance':0,
			  'waypoints':wp,
			 };
    	$http.post('/api/rest/mapSegment',JSON.stringify(newSegment)).then(function(data){
    		//return needs to be geojson
    		$log.log(data.data);
    		//add to geojson...
    		geoJsonLayer.addData(data.data);
    		
    		setStartPoint(endLat,endLng);
    		
    		//unset things
    		endLat = null;
    		endLng = null;
    		endLayer.clearLayers();
    		latestPathLayer.clearLayers();
    		$scope.endSet = false;	
	});
	
	$log.log($scope.dateRangeStart);
    };  // end of createSegment
    
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
