(function(angular){
angular.module('myApp', ['ngRoute'])
.config(['$routeProvider', function ($routeProvider) {
		$routeProvider
		.when("/",{
			templateUrl:"/static/partials/editor-adventures.html",
			controller:"advEditorController"
		})
		.when("/maps",{
			templateUrl:"/static/partials/editor-maps.html",
			controller:"advEditorController"
		})
		.when("/blogs",{
			templateUrl:"/static/partials/editor-blogs.html",
			controller:"advEditorController"
		})
		.when("/gear", {
			templateUrl: "/static/partials/editor-gear.html",
			controller: "advEditorController"
		});
}])
.controller("mainController",['$scope','$http','$log',function($scope,$http,$log){
    var userId = document.getElementById("userId").value;
    $scope.userId = userId;
    
    $http.get('/api/rest/adventures/' + userId).then(function(data){ 
	$scope.adventures = data.data;	
    });    
}])
.controller("advEditorController",['$scope','$http','$log',function($scope,$http,$log){
    $scope.profilePic = "/static/img/blank-profile-picture.png";

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
	var advId = $scope.adventures[index].id;
    	$http.delete('/api/rest/adventures/'+advId).then(function(resp){
    		//clear entry from list
    		$scope.adventures.splice(index,1);
    	});
    };    
}]);
})(window.angular);
