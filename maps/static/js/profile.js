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
    $http.get('/api/rest/adventures/' + userId).then(function(data){
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
    L.mapbox.accessToken = 'pk.eyJ1IjoiYWdpbG1hbiIsImEiOiI3a05GVF9vIn0.c5pOjAXGeRPbv35PRmK90A';
    var map = L.mapbox.map('map', 'agilman.l3lp6544')
    .setView([45.5, -122.50], 6);
    
    //visualize adventures on map
	$log.log("Hello from Adv controller");
	
}])
.controller('mapsController',['$scope','$window','$log',function($scope,$window,$log){
	$log.log("Hello from maps controller");
}])
.controller('blogsController',['$scope','$window','$log',function($scope,$window,$log){
	$log.log("Hello from blogs controller");
}])
.controller('gearController',['$scope','$window','$log',function($scope,$window,$log){
	$log.log("Hello from gear controller");
}]);
})(window.angular);
