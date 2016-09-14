(function(angular){
angular.module('myApp', [])
.controller('advSelection', ['$scope','$http', function($scope,$http) {
    var userId = document.getElementById("userId").value;
    $scope.userId = userId;
    
    //TODO check proper way of handling rest
    $http.get('/api/rest/adventures/' + userId).then(function(data){ 
		$scope.toDoLists = data.data.lists;
	});
			
	//alert("hi");
}]);
})(window.angular);
