function drawStartCircle(lat,lng){
    //erase previous circle
    startLayer.clearLayers();

    //draw circle
    var circleOptions = {'color':'#551A8B'}
    var newLatLng = new L.latLng(lat,lng);
    var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(3);    
    
    marker.addTo(startLayer);	
}

function drawFinishCircle(lat,lng){
    finishLayer.clearLayers();

    //draw circle
    var circleOptions = {'color':'#FB0C00'}
    var newLatLng = new L.latLng(lat,lng);
    var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(3);    
    
    marker.addTo(finishLayer);
}

function getNavLine(startLat,startLng,endLat,endLng,navType){
    var newCoordinates = [];
    var distance = 0;
    if (navType=="line"){
	newCoordinates.push([parseFloat(startLat),parseFloat(startLng)]);
	newCoordinates.push([parseFloat(endLat),parseFloat(endLng)]);
	
	var startLatLng =  new L.latLng(parseFloat(startLat),parseFloat(startLng));
	var endLatLng = new L.latLng(parseFloat(endLat),parseFloat(endLng));
	distance = Math.floor(startLatLng.distanceTo(endLatLng));
	
    }else{
	/**
	var accessToken = document.getElementById("mapBoxToken").value;
	var myURL ="https://api.mapbox.com/v4/directions/mapbox."+navType+"/"+ startLng+","+startLat+";"+endLng+","+endLat+".json?access_token="+accessToken\
	;
	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET",myURL,false);
	xmlhttp.send();
	
	var json_back = JSON.parse(xmlhttp.response);
	var aCoords = json_back.routes[0].geometry.coordinates;
	
	for (var i = 0; i < aCoords.length; i++){
	    newCoordinates.push([aCoords[i][1],aCoords[i][0]]);
	}
	
	distance = json_back.routes[0].distance;
	*/
    }
    
    return {'navLine':newCoordinates,'distance':distance};
}


