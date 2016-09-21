(function(angular){
angular.module('myApp', [])
.controller('appController', ['$scope','$http', function($scope,$http) {
    var userId = document.getElementById("userId").value;
    $scope.userId = userId;
    $scope.profilePic = "/static/img/blank-profile-picture.png";
    
    //TODO check proper way of handling rest
    $http.get('/api/rest/adventures/' + userId).then(function(data){ 
		$scope.adventures = data.data;	
	});
    
    $scope.$on('removeAdvEvent',function(event,index){
    	var advId = $scope.adventures[index].id;
    	$http.delete('/api/rest/adventures/'+advId).then(function(resp){
    		//clear entry from list
    		$scope.adventures.splice(index,1);
    	});
    });
}])
.controller('advSelectionController', ['$scope','$http', function($scope,$http) {
	$scope.createAdv = function(){
		var advName = document.getElementById("newAdvName").value;
		//prepare json to pass                                                                                                                                       
        var newAdv = {'owner':$scope.userId,'name':advName};

        $http.post('/api/rest/adventures/'+$scope.userId,JSON.stringify(newAdv)).then(function(data){
            $scope.adventures.push(data.data);
            
            //clear field
            document.getElementById("newAdvName").value="";
        })
	};
	$scope.removeAdvClick = function(index){
		$scope.$emit('removeAdvEvent',index);
	};
}]);
})(window.angular);