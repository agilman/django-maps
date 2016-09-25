function draw_circle(lat,lng){
    //erase previous circle
    latestDotLayer.clearLayers();

    //draw circle
    var circleOptions = {'color':'#FB0C00'}
    var newLatLng = new L.latLng(lat,lng);
    var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(3);    
    
    marker.addTo(latestDotLayer);
	
}