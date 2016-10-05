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
	    controller:"mapEditorController",
	})
	.when("/:advId/blogs",{
	    templateUrl:"/static/partials/editor-blogs.html",
	    controller:"blogEditorController"
	})
	.when("/:advId/gear", {
	    templateUrl: "/static/partials/editor-gear.html",
	    controller: "gearEditorController"
	});
}])
.controller("mainController",['$scope','$http','$log',function($scope,$http,$log){
    var userId = document.getElementById("userId").value;
    $scope.userId = userId;
    $scope.adventures = [];
    $scope.currentAdvId=null;
    $scope.currentAdvName=null;
    $scope.currentAdvIndex=null;

    $scope.currentEditorPage=null;
    
    $http.get('/api/rest/userInfo/' + userId).then(function(data){
    	$scope.adventures = data.data;
    	//Get latest adv if adventureId not provided...
	if ($scope.adventures.length > 0){
    	    $scope.currentAdvId  = $scope.adventures[$scope.adventures.length-1].id;
    	    $scope.currentAdvName= $scope.adventures[$scope.adventures.length-1].name;
	    $scope.currentAdvIndex=$scope.adventures.length-1;
	}
    });

    $scope.isAdvEditorActive = function(){
	if ($scope.currentEditorPage=="advs"){
	    return "active";
	}
    };

    $scope.isMapEditorActive = function(){
	if ($scope.currentEditorPage=="maps"){
	    return "active";
	}
	};
    $scope.isBlogEditorActive = function(){
	if ($scope.currentEditorPage=="blogs"){
	    return "active";
	}
    };
    
    $scope.isGearEditorActive = function(){
	if ($scope.currentEditorPage=="gear"){
	    return "active";
	}
    };

    $scope.$on('setAdvEditorActive',function(event){
	$scope.currentEditorPage='advs';
    });

    $scope.$on('setMapEditorActive',function(event){
	$scope.currentEditorPage='maps';
    });

    $scope.$on('setBlogEditorActive',function(event){
	$scope.currentEditorPage='blogs';
    });

    $scope.$on('setGearEditorActive',function(event){
	$scope.currentEditorPage='gear';
    });
    
    $scope.$on('advChangeEvent',function(event,indx){
	$scope.currentAdvId   =  $scope.adventures[indx].id;
    	$scope.currentAdvName = $scope.adventures[indx].name;
	$scope.currentAdvIndex= indx;
    });

    $scope.$on('deselectAdv',function(event){
	$scope.currentAdvId=null;
	$scope.currentAdvName=null;
	$scope.currentAdvIndex=null;
    });
    
}])
.controller("mapEditorController",['$scope','$http','$log','$routeParams','leafletData',function($scope,$http,$log, $routeParams,leafletData){
    $scope.$emit("setMapEditorActive");
    //set map based on url...
    var urlAdvId  = $routeParams.advId;
    //emit... if needed.
    $scope.currentAdvId=urlAdvId;
    
    $scope.maps = [];
    $scope.currentMapIndx = null;
    $scope.currentMapId= null;
    $scope.currentMapName=null;
    $scope.startSet = false;
    startLat = null;
    startLng = null;
    startDatetime = null;
    $scope.startTime = null;
    $scope.endtTime = null;
    $scope.segmentDistance = null;
    $scope.dayNotes = null;

    $scope.endSet = false;
    endLat = null;
    endLng = null;
    finishDatetime = null;
    navActive=3;
    $scope.pleasesWait = true;
    $scope.showSegment = false;
    $scope.selectedSegmentStartTime = null;
    $scope.selectedSegmentEndTime = null;
    $scope.selectedSegmentDistance = null;
    $scope.selectedSegmentNotes = null;
    $scope.currentSegmentIndex=null;
    $scope.segmentsData = null;

    $scope.delayOptions = [{ label: "No delay", value: 0 }, { label: "5 Days", value: 5 },{ label: "15 Days", value: 15 },{ label: "30 Days", value: 30 }];
    $scope.selectedDelayOption = $scope.delayOptions[0];    
    
    mapboxToken = document.getElementById("mapboxToken").value;
    mapboxMapName = document.getElementById("mapboxMap").value;

    //init geocoder
    leafletData.getMap().then(function(map){
	L.Control.geocoder().addTo(map);
    });
    
    function fitMap(bounds){
    	leafletData.getMap().then(function(map) {
            map.fitBounds(bounds);
    	});
    };

    function centerMap(center){
	leafletData.getMap().then(function(map){
	    map.panTo(center);

	    if (map.getZoom()<7){
		map.setView(center,9);
	    }else if (map.getZoom()>11){
		map.setView(center,9);
	    }
	    
	});
    };

    function centerOnStart(lat,lng){
	leafletData.getMap().then(function(map){
	    map.setView([lat,lng],9);
	});
    }

    function flyTo(center){
	leafletData.getMap().then(function(map){
	    var zoom = map.getZoom();
	    if (zoom>11){
		map.flyTo(center,10);
	    }else if(zoom<6){
		map.flyTo(center,10);
	    }else{
		map.flyTo(center);
	    }
	});
    };

    setupMapFromDOM = function(index){
	//get Map
	$http.get('/api/rest/maps/' + $scope.currentMapId).then(function(data){
	    //should this be attached to $scope?
	    $scope.segmentsData = data.data;
	    geoJsonLayer.addData($scope.segmentsData);

	    //draw circles (currently markers) on segment centers, for segment selection.
	    drawSegmentCenters($scope.segmentsData);
	    
	    //set startPoint to last point from established line...
	    if ($scope.segmentsData.features.length>0){
	    	var lastSegment = $scope.segmentsData.features[$scope.segmentsData.features.length-1].geometry.coordinates;	
	    	
	    	if (lastSegment.length>0){
	    	    startLat = lastSegment[lastSegment.length-1][1];
	    	    startLng = lastSegment[lastSegment.length-1][0];

		    //center map on last point
		    centerOnStart(startLat,startLng);
	    	    //fitMap(geoJsonLayer.getBounds());
		    
	    	    setStartPoint(startLat,startLng);
	    	    $scope.startSet = true;
	    	}
	    }else{ //if the selected map doesn't have any points
	    	startLat = null;
	    	startLng = null;
	    	$scope.startSet = false;    		
	    }
	});
    };

    function addSegmentMarker(segment){
	//this is invoked on 'save segment' button. It marks the segment center marker.
	var coordinates = segment.geometry.coordinates;
	point =[];
	if (coordinates.length==2){
	    point = coordinates[0];
	}else{
	    point = coordinates[Math.floor(coordinates.length/2)];
	}

	var markerPoint = [point[1],point[0]];
	var newMarker = new L.Marker(markerPoint).on('click',$scope.segmentMarkerClick);
	newMarker.segmentId = segment.properties.segmentId;
	newMarker.addTo(segmentMarkersLayer);
    };
    
    function drawSegmentCenters(segments){
	//clear previous
	segmentMarkersLayer.clearLayers();
	
	for(var i = 0;i<segments.features.length;i++){
	    var coordinates = segments.features[i].geometry.coordinates;
	    var point = [ ];
	    var segmentId =  segments.features[i].properties.segmentId;
	    if (coordinates.length==2){
		// TODO:this is a line... need to find it's geometric center
		point = coordinates[0];
		
	    }else{
		// this is a navline... just take a middle point
		
		point = coordinates[Math.floor(coordinates.length/2)];
	    }
	    
	    var markerPoint = [point[1],point[0]];
	    var newMarker = new L.Marker(markerPoint).on('click',$scope.segmentMarkerClick);
	    newMarker.segmentId = segmentId;
	    newMarker.addTo(segmentMarkersLayer);
	}
    }

    $scope.deselectSegment = function(){
	$scope.showSegment = false;
	selectedSegmentLayer.clearLayers();

	//TODO: bring focus around last point;
	var center = new L.LatLng(startLat,startLng);
	flyTo(center);
    };

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
	},
	mapbox4:{
	    name: "Mapbox Satellite",
	    type: "xyz",
	    url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=' + mapboxToken,
	    layerOptions: {
		continuousWorld:true
	    }
	},
	mapbox5:{
	    name: "Mapbox Satellite-hybrid",
	    type: "xyz",
	    url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=' + mapboxToken,
	    layerOptions: {
		continuousWorld:true
	    }
	},
	osm:{
	    name: "OpenStreetMap",
	    type: "xyz",
	    url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	    layerOptions: {
		subdomains: ["a", "b", "c"],
		attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
		continuousWorld: true
	    }
	},
	cycling:{
	    name: "OpenCycleMap",
	    type: "xyz",
	    url: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
	    layerOptions: {
		subdomains: ["a", "b", "c"],
		attribution: "&copy; <a href=\"http://www.opencyclemap.org/copyright\">OpenCycleMap</a> contributors - &copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
		continuousWorld: true
	    }
	}
    }

    //Load maps, and latest segments
    $http.get('/api/rest/advMaps/' + urlAdvId).then(function(data){
    	$scope.maps = data.data;
    	
    	if($scope.maps.length>0){
    	    $scope.currentMapId  =  $scope.maps[$scope.maps.length-1].id;
    	    $scope.currentMapName= $scope.maps[$scope.maps.length-1].name;
    	    $scope.currentMapIndx= $scope.maps.length-1;
    	        
    	    setupMapFromDOM($scope.maps.length-1);
    	}
	$scope.pleasesWait = false;
    });
    
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
	
    //after leaflet loads, create layers
    leafletData.getMap().then(function(map){
    	startLayer = new L.LayerGroup();
    	startLayer.addTo(map);
    	
    	endLayer = new L.LayerGroup();
    	endLayer.addTo(map);

    	latestPathLayer = new L.LayerGroup();
    	latestPathLayer.addTo(map);

	//This is used to draw current established map
    	geoJsonLayer = new L.geoJson();
    	geoJsonLayer.addTo(map);

	segmentMarkersLayer = new L.LayerGroup();
	segmentMarkersLayer.addTo(map);

	selectedSegmentLayer = new L.LayerGroup();
	selectedSegmentLayer.addTo(map);
    });
    
    // map click
    $scope.$on("leafletDirectiveMap.click",function(e,wrap){
	//unset segment selection view
	$scope.showSegment = false;

	
    	var lat = wrap.leafletEvent.latlng.lat;
    	var lng = wrap.leafletEvent.latlng.lng;
    	
    	//set start point.
    	if (!$scope.startSet){
    	    setStartPoint(lat,lng);
    	    $scope.startSet = true;
    	}else{
    	    var navData = setEndPoint(lat,lng);
    	    newSegmentPath = navData.navLine;
    	    $scope.segmentDistance = navData.distance;
    	    
    	    $scope.endSet = true;
    	}
    });

    $scope.showNextSegmentButton = function(){
	if ($scope.segmentsData){
	    if($scope.currentSegmentIndex < $scope.segmentsData.features.length-1){
		return true;
	    }
	}
	
	return false;
    }
    
    $scope.selectMapClick = function(index){
    //if change is needed...
	$scope.currentMapId = $scope.maps[index].id;
	$scope.currentMapName = $scope.maps[index].name;

	if ($scope.currentMapIndx == index){
	    fitMap(geoJsonLayer.getBounds());
	}else{
	    $scope.currentMapIndx = index;
	    endLat = null;
	    endLng = null;
	    $scope.endSet = false;
	    setupMapFromDOM(index);//load right map...
	    
	    clearLayers();
	}
    };
    
    
    /////NAV Type selection....
    $scope.isNavLineActive = function(){
    	if (navActive==1){
    		return "btn btn-primary";
    	}
    	else{ return "btn btn-secondary";}
    };
    $scope.isNavBikeActive = function(){
    	if (navActive==2){
    		return "btn btn-primary";
    	}
    	else{ return "btn btn-secondary";}
    };
    $scope.isNavCarActive = function(){
    	if (navActive==3){
    		return "btn btn-primary";
    	}
    	else{ return "btn btn-secondary";}
    };
    $scope.setLineActive = function(){
    	navActive=1;    	
    };
    $scope.setBikeActive = function(){
    	navActive=2;    	
    };
    $scope.setCarActive = function(){
    	navActive=3;    	
    };
    
    
    $scope.isMapActive = function(index){
    	if($scope.maps[index].id == $scope.currentMapId){
    		return true;
    	}else{
    		return false;
    	}
    };
    
    $scope.isMapVisible = function(){
    	if ($scope.maps.length>0){
    	    return true;
    	} else{
    	    return false;
    	}
    }
    $scope.isSegmentsVisible = function(){
    	if ($scope.startSet){
    	    return true;
    	}
    	else{
    	    return false;
    	}
    };
    $scope.isSegmentsHidden = function(){
	if (!$scope.isSegmentsVisible()){
	    return true;
	} else {
	    if ($scope.showSegment){
		return true;}
	    else{
		return false;}
	}
    };
    
    $scope.getSegmentDistance = function(){
    	return Number($scope.segmentDistance/1000).toFixed(1);
    }

    $scope.getSelectedSegmentDistance = function(){
	return Number($scope.selectedSegmentDistance/1000).toFixed(1);
    }
    
    $scope.getMapDistance = function(index){
    	if($scope.maps[index].distance){
    	    return Number($scope.maps[index].distance/1000).toFixed(1);
    	}
    	else{
    	    return 0;
    	}
    }
    
    $scope.createMap = function(){
    	var mapName = $scope.newMapName;
    	//prepare json to pass
    	var newMap = {'advId':$scope.currentAdvId,'name':mapName};
    	$http.post('/api/rest/advMaps/'+$scope.currentAdvId,JSON.stringify(newMap)).then(function(data){
    	    var latestMap = data.data;
    	    $scope.maps.push(latestMap);   		
    	    
    	    $scope.currentMapId= latestMap.id;
    	    $scope.currentMapName = latestMap.name;
    	    $scope.currentMapIndx = $scope.maps.length-1;
    	    
    	    if(startLat & startLng){
    		setStartPoint(startLat,startLng);
    	    }
    	    //clear things
    	    endLayer.clearLayers();
    	    latestPathLayer.clearLayers();
    	    geoJsonLayer.clearLayers();
	    segmentMarkersLayer.clearLayers();
	    selectedSegmentLayer.clearLayers();
    	    $scope.newMapName = null;
    	    $scope.segmentDistance = null;
	    $scope.showSegment = false;
    	})
    };
    
    $scope.createSegment = function(){
    	var newSegment = {'mapId':$scope.currentMapId,
			  'startTime':$scope.dateRangeStart,
			  'endTime': $scope.dateRangeEnd,
			  'distance': $scope.segmentDistance,
			  'waypoints':newSegmentPath,
			  'dayNotes':$scope.dayNotes,
			  'delay':$scope.selectedDelayOption.value,
			 };
    	$http.post('/api/rest/mapSegment',JSON.stringify(newSegment)).then(function(data){
    	    //return needs to be geojson
    	    var jsonData = data.data
    	    //add to geojson...
    	    geoJsonLayer.addData(jsonData);
    	    $scope.maps[$scope.currentMapIndx].distance += $scope.segmentDistance;
    	    setStartPoint(endLat,endLng);
	    
	    $scope.segmentsData.features.push(jsonData);
	    
	    //Add marker to map.
	    addSegmentMarker(jsonData);
    	    
    	    //unset things
    	    endLat = null;
    	    endLng = null;
    	    newSegmentPath = [];
    	    endLayer.clearLayers();
    	    latestPathLayer.clearLayers();
	    selectedSegmentLayer.clearLayers();

    	    $scope.segmentDistance = null;
    	    $scope.endSet = false;
	    $scope.dayNotes = null;
	    
    	});
	
    };  // end of createSegment

    $scope.deselectEndSet = function(){
	$endLat = null;
	$endLng = null;
	newSegmentPath = [];
	endLayer.clearLayers();
	latestPathLayer.clearLayers();
	$scope.endSet = null;
	$scope.segmentDistance=null;
    };

    ///////TODO:::: REFACTOR these 3 function: 
    
    $scope.segmentMarkerClick= function(e){
	$scope.showSegment=true;
	//$log.log($scope.segmentsData);
	$scope.currentSegmentIndex = getSegmentIndexById($scope.segmentsData,e.target.segmentId);
	
	var segment =$scope.segmentsData.features[$scope.currentSegmentIndex];
	var properties = segment.properties; 
	var myPolyline = drawSegmentHighlight(segment.geometry.coordinates);
	
	//TODO: instead of fitMap, flyTo center on line, at reasonable zoom.
	centerMap(myPolyline.getBounds().getCenter());
	
	$scope.selectedSegmentDistance = properties.distance;
	$scope.selectedSegmentStartTime = properties.startTime;
	$scope.selectedSegmentEndTime = properties.endTime;
	$scope.selectedSegmentNotes = properties.notes[0];
    };
    
    $scope.loadPreviousSegment = function(){
	//$scope.showSegment=true;
	//$log.log($scope.segmentsData);
	$scope.currentSegmentIndex -= 1;
	
	var segment =$scope.segmentsData.features[$scope.currentSegmentIndex];
	var properties = segment.properties; 
	var myPolyline = drawSegmentHighlight(segment.geometry.coordinates);

	centerMap(myPolyline.getBounds().getCenter());

	$scope.selectedSegmentDistance = properties.distance;
	$scope.selectedSegmentStartTime = properties.startTime;
	$scope.selectedSegmentEndTime = properties.endTime;
	$scope.selectedSegmentNotes = properties.notes[0];	
    };

    $scope.loadNextSegment = function(){
	//$scope.showSegment=true;
	//$log.log($scope.segmentsData);
	$scope.currentSegmentIndex += 1;
	
	var segment =$scope.segmentsData.features[$scope.currentSegmentIndex];
	var properties = segment.properties; 
	var myPolyline = drawSegmentHighlight(segment.geometry.coordinates);

	centerMap(myPolyline.getBounds().getCenter());

	$scope.selectedSegmentDistance = properties.distance;
	$scope.selectedSegmentStartTime = properties.startTime;
	$scope.selectedSegmentEndTime = properties.endTime;
	$scope.selectedSegmentNotes = properties.notes[0];	
    };

    

    
    
    $scope.deleteMap = function(index){
       	var mapId = $scope.maps[index].id;
    	$http.delete('/api/rest/maps/'+mapId).then(function(resp){
    	    //clear entry from list
    	    $scope.maps.splice(index,1);
    	    
    	    if (mapId == $scope.currentMapId){
    		clearLayers();
    		endLat = null;
    		endLng = null;
    		startLng = null;
    		startLat = null
    		$scope.startSet = null;
    		$scope.endSet = null;
    	    }
	    $scope.showSegment=false;
    	});
    };
}])
.controller("blogEditorController",['$scope','$http','$log',function($scope,$http,$log){
    $scope.$emit('setBlogEditorActive');
}])
.controller("gearEditorController",['$scope','$http','$log',function($scope,$http,$log){
    $scope.$emit('setGearEditorActive');
}])
.controller("advEditorController",['$scope','$http','$log',function($scope,$http,$log){
    $scope.$emit('setAdvEditorActive');
    $scope.profilePic = "/static/img/blank-profile-picture.png";
    
    $scope.isAdvSelected = function(index){
	if ($scope.currentAdvIndex ==index){
	    return "active";
	}else{
	 //pass
	}
    };
    
    $scope.createAdv = function(){
	var advName = document.getElementById("newAdvName").value;
	//prepare json to pass                                                                                                                                       
        var newAdv = {'owner':$scope.userId,'name':advName};
	
        $http.post('/api/rest/adventures',JSON.stringify(newAdv)).then(function(data){
            $scope.adventures.push(data.data);
            
            //clear field
            document.getElementById("newAdvName").value="";

	    //change to latest
	    $scope.$emit('advChangeEvent', $scope.adventures.length-1);
        })
    };
    
    $scope.deleteAdv = function(index){
	var advId = $scope.adventures[index].id;
    	$http.delete('/api/rest/adventures/'+advId).then(function(resp){
    	    //clear entry from list
    	    $scope.adventures.splice(index,1);

	    //if after delete there are no adventures:
	    //  deselect currentAdvItems
	    //else
	    // if deleted adventure after the currently selected adv: no changes
	    // elif deleted adventure before the currently selected adv: need to change current adv to one below
	    // elif deleted adventure that is currently selected:
	    //   select last adv
	    //

	    if ($scope.adventures.length==0){
		$scope.$emit("deselectAdv");
	    }else{
		if (index > $scope.currentAdvIndex){
		    //noChanges
		}else if (index < $scope.currentAdvIndex){
		    $scope.$emit('advChangeEvent',$scope.currentAdvIndex-1);
		}else if (index == $scope.currentAdvIndex){
		    $scope.$emit('advChangeEvent',$scope.adventures.length-1);
		}
	    }
    	});
    };

    $scope.advClick = function(index){
	$scope.$emit('advChangeEvent',index);
    };

}]);
})(window.angular);
