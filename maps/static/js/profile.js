(function(angular){
angular.module('myApp', ['ngRoute'])
.config(['$routeProvider', function ($routeProvider) {
		$routeProvider
		.when("/",{
			templateUrl:"/static/partials/profile-adventures.html",
			controller:"advSelController"
		})
		.when("/maps",{
			templateUrl:"/static/partials/profile-maps.html",
			controller:"mapsController"
		})
		.when("/blogs",{
			templateUrl:"/static/partials/profile-blogs.html",
			controller:"advSelController"
		})
		.when("/gear",{
			templateUrl:"/static/partials/profile-gear.html",
			controller:"advSelController"
		})
		;
	
}])
.controller('badController', ['$scope','$http','$log', function($scope,$http,$log) {
	$log.log("Hi");
}])
.controller('mainController',['$scope','$window','$log',function($scope, $window,$log){
	$log.log("hi");
	
}]);
})(window.angular);
