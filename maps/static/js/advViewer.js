(function(angular){
angular.module('myApp', [])
.controller('advSelection', ['$scope','$http', function($scope,$http) {
    var userId = 1; //document.getElementById("userId").value;
    $scope.userId = userId;
    $http.get('/services/api/userAdventures?userId='+userId).then(function(data){
		$scope.toDoLists = data.data.lists;
	});
			
	alert("hi");
}]);
})(window.angular);
