(function(angular){
angular.module('myApp', [])
.controller('appController', ['$scope','$http', function($scope,$http) {
    var userId = document.getElementById("userId").value;
    $scope.userId = userId;
    
    //TODO check proper way of handling rest
    $http.get('/api/rest/adventures/' + userId).then(function(data){ 
		$scope.adventures = data.data;	
	});
}])
.controller('advSelectionController', ['$scope','$http','$log', function($scope,$http,$log) {
	$scope.createAdv = function(){
		var advName = document.getElementById("newAdvName").value;
		//prepare json to pass                                                                                                                                       
        var newAdv = {'owner':$scope.userId,'name':advName};

        $http.post('/api/rest/adventures/'+$scope.userId,JSON.stringify(newAdv)).then(function(data){
            $scope.adventures.push(data.data);
            
            //clear field
            document.getElementById("newAdvName").value="";
	})};	
}]);
})(window.angular);