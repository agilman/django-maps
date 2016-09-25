(function(angular){
angular.module('myApp', ['ngRoute','ui.bootstrap.datetimepicker'])
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
.controller("mapsEditorController",['$scope','$http','$log','$routeParams',function($scope,$http,$log, $routeParams){
    //TODO: Set $scope.currentAdvId from from routeParams
    var urlAdvId  = $routeParams.advId;
	
    //init map
    var token = document.getElementById("mapboxToken").value;
    var mapboxMapname = document.getElementById("mapboxMap").value;
    
    L.mapbox.accessToken = token; 
    var map = L.mapbox.map('map', mapboxMapname)
    
    latestDotLayer = new L.layerGroup();
    latestDotLayer.addTo(map);
    
    map.on('click',function(e){
	$scope.newLatLng_lat = e.latlng.lat;
	$scope.newLatLng_lng = e.latlng.lng;
	//emit depending on situation
	
	//draw circle
	draw_circle($scope.newLatLng_lat, $scope.newLatLng_lng);
    });
    
    $http.get('/api/rest/advMaps/' + urlAdvId).then(function(data){
    	$scope.maps = data.data;
    	
    	if($scope.maps.length>0){
    	    $scope.currentMapId  =  $scope.maps[0].id;
    	    $scope.currentMapName= $scope.maps[0].name;
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
	$log.log($scope.dateRangeStart);
	
    };
    
    $scope.deleteMap = function(index){
    	var mapId = $scope.maps[index].id;
    	$http.delete('/api/rest/maps/'+mapId).then(function(resp){
    		//clear entry from list
    		$scope.maps.splice(index,1);
    	});
    }
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
