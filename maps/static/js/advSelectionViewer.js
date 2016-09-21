(function(angular){
angular.module('myApp', [])
.controller('appController', ['$scope','$http', function($scope,$http) {
    var userId = document.getElementById("userId").value;
    $scope.userId = userId;
    
    //init map
    L.mapbox.accessToken = 'pk.eyJ1IjoiYWdpbG1hbiIsImEiOiI3a05GVF9vIn0.c5pOjAXGeRPbv35PRmK90A';
    var map = L.mapbox.map('map', 'agilman.l3lp6544')
        .setView([45.5, -122.50], 6);
    
    //TODO check proper way of handling rest
    $http.get('/api/rest/adventures/' + userId).then(function(data){ 
		$scope.adventures = data.data;	
	});
}])
.controller('advSelectionController',['$scope','$window',function($scope, $window){
	$scope.goToAdv = function(advId){
		var userName = document.getElementById("userName").value;
		var gotoAddress = "/users/"+userName+"/adventures/"+advId;
		$window.location.href = gotoAddress;
	};
}]);
})(window.angular);
