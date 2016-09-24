(function(angular){
angular.module('myApp', ['ngRoute'])
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
.controller('mainController',['$scope','$window','$log','$http',function($scope,$window,$log,$http){
	//get adventure lists
	var userId = document.getElementById("userId").value;
    //TODO check proper way of handling rest                                                                                                                         
    $http.get('/api/rest/userInfo/' + userId).then(function(data){
                $scope.adventures = data.data;
                $scope.currentAdvId = $scope.adventures[0].id;
                $scope.currentAdvName = $scope.adventures[0].name;
    });
    
}])
.controller('advController',['$scope','$window','$log',function($scope,$window,$log){
	
	//Check if user has adventures
	//if he doesn't, show message.
	
	//if there are maps worth visualizing
    //init map
    var token = document.getElementById("mapboxToken").value;
    var mapboxMapname = document.getElementById("mapboxMap").value;
    
    L.mapbox.accessToken = token; 
    var map = L.mapbox.map('map', mapboxMapname)
    
    //visualize adventures on map	
}])
.controller('mapsController',['$scope','$window','$log','$routeParams',function($scope,$window,$log,$routeParams){
	var currentAdvFromUrl  = $routeParams.advId;
	$log.log("Current adv from url: "+ currentAdvFromUrl);
}])
.controller('blogsController',['$scope','$window','$log',function($scope,$window,$log){
	$log.log("Hello from blogs controller");
}])
.controller('gearController',['$scope','$window','$log',function($scope,$window,$log){
	$log.log("Hello from gear controller");
}]);
})(window.angular);
