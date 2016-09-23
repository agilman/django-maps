(function(angular){
angular.module('myApp', ['ngRoute'])
.config(['$routeProvider', function ($routeProvider) {
		$routeProvider
		.when("/",{
			templateUrl:"/static/partials/profile-adventures.html",
			controller:"advController"
		})
		.when("/maps",{
			templateUrl:"/static/partials/profile-maps.html",
			controller:"mapsController"
		})
		.when("/blogs",{
			templateUrl:"/static/partials/profile-blogs.html",
			controller:"blogsController"
		})
		.when("/gear",{
			templateUrl:"/static/partials/profile-gear.html",
			controller:"gearController"
		});	
}])
.controller('mainController',['$scope','$window','$log',function($scope,$window,$log){
	$log.log("Hello from main controller");
}])
.controller('advController',['$scope','$window','$log',function($scope,$window,$log){
    L.mapbox.accessToken = 'pk.eyJ1IjoiYWdpbG1hbiIsImEiOiI3a05GVF9vIn0.c5pOjAXGeRPbv35PRmK90A';
    var map = L.mapbox.map('map', 'agilman.l3lp6544')
        .setView([45.5, -122.50], 6);
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
