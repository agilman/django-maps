(function(angular){
angular.module('myApp', [])
.controller('appController', ['$scope','$http', function($scope,$http) {
    var userId = document.getElementById("userId").value;
    $scope.userId = userId;
    
    //TODO check proper way of handling rest
    $http.get('/api/rest/adventures/' + userId).then(function(data){ 
		$scope.adventures = data.data;
		
		$scope.selectedAdventure = 0;
		$scope.$broadcast('adventureChangeBroadcast',$scope.selectedAdventure);
	});
	
}])
.controller('advSelectionController',['$scope',function($scope){
	$scope.$on("adventureChangeBroadcast",function(event,data){
		alert('got adv change');
	});
}]);
})(window.angular);
