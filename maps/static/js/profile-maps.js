
function drawSegmentHighlight(segment){
    //given a segment, this function adds it to selectedSegmentLayer (used to show specific day when selected)

    segmentHighlightLayer.clearLayers();


    var newSegment = [];
    for (var i = 0; i < segment.length;i++){
	newSegment.push([segment[i][1],segment[i][0]]);
    }

    var polyline_options = {
	color: '#ff751a',
	weight: '8'
    };

    var polyline = new L.polyline(newSegment, polyline_options).addTo(segmentHighlightLayer);
    return polyline;
}

function markCurrentPath(coords){
    currentAdvLayer.clearLayers();
    var newSegment = [];
    for (var i = 0; i < coords.length;i++){
	newSegment.push([coords[i][1],coords[i][0]]);
    }

    var polyline_options = {
	color: '#337ab7',
	weight: '8'
    }

    var polyline = new L.polyline(newSegment, polyline_options).addTo(currentAdvLayer);
    return polyline;
}
