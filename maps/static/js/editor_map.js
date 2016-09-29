function drawStartCircle(lat,lng){
    //erase previous circle
    startLayer.clearLayers();

    //draw circle
    var circleOptions = {'color':'#551A8B'}
    var newLatLng = new L.latLng(lat,lng);
    var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(3);    
    
    marker.addTo(startLayer);	
}
function clearLayers(){
	startLayer.clearLayers();
	endLayer.clearLayers();
	latestPathLayer.clearLayers();
	geoJsonLayer.clearLayers();
};


function drawFinishCircle(lat,lng){
    endLayer.clearLayers();

    //draw circle
    var circleOptions = {'color':'#FB0C00'}
    var newLatLng = new L.latLng(lat,lng);
    var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(3);    
    
    marker.addTo(endLayer);
}

function setStartPoint(lat,lng){
    startLat = lat;
    startLng = lng;

    drawStartCircle(lat,lng);
}

function setEndPoint(lat,lng){
    endLat = lat;
    endLng = lng;
    
    drawFinishCircle(lat,lng);
    
	navInfo = getNavLine(startLat,startLng,endLat,endLng);

	var navLine = navInfo.navLine;


	var polyline_options = {
			color: '#00264d'
	};

	latestPathLayer.clearLayers();
	var polyline = L.polyline(navLine, polyline_options).addTo(latestPathLayer);
	
	return navInfo;
}

function getNavLine(startLat,startLng,endLat,endLng,navType){
    var newCoordinates = [];
    var distance = 0;
    if (navActive==1){ //If navtype is line
	newCoordinates.push([parseFloat(startLat),parseFloat(startLng)]);
	newCoordinates.push([parseFloat(endLat),parseFloat(endLng)]);
	
	var startLatLng =  new L.latLng(parseFloat(startLat),parseFloat(startLng));
	var endLatLng = new L.latLng(parseFloat(endLat),parseFloat(endLng));
	distance = Math.floor(startLatLng.distanceTo(endLatLng));
	
    }else{ //If navtype requires getting directions from mapbox api
    	var navTypeStr = "cycling";
    	if (navActive == 3){ navTypeStr = "driving";};
	
    	var accessToken = mapboxToken;	
    	var myURL ="https://api.mapbox.com/directions/v5/mapbox/"+navTypeStr+"/"+ startLng+","+startLat+";"+endLng+","+endLat+"?access_token="+accessToken	;
	
    	var xmlhttp = new XMLHttpRequest();
    	xmlhttp.open("GET",myURL,false);
    	xmlhttp.send();

    	var json_back = JSON.parse(xmlhttp.response);
    	
    	var navOption = json_back.routes[0];
    	var navPolyline = navOption.geometry;

    	var test = L.Polyline.fromEncoded(navPolyline);
    	console.log(test);
    	
    	for (var i = 0;i < test._latlngs.length; i++){
    		newCoordinates.push([test._latlngs[i].lat ,test._latlngs[i].lng]);
    		
    	}
    	
    	distance = json_back.routes[0].distance;
    	
    	}
    
    return {'navLine':newCoordinates,'distance':distance};
}


