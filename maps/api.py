from maps.models import Adventure, Map , MapSegment, WayPoint
from maps.serealizers import AdventureSerializer, MapSerializer, MapSegmentSerializer
from django.http import JsonResponse

from collections import OrderedDict

from django.contrib.auth.models import User
###REST 
#from django.shortcuts import render
#from django.http import HttpResponse
#from django.http import HttpRequest
#from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt

#from rest_framework.decorators import api_view
#from rest_framework.response import Response
        
@csrf_exempt
def userInfo(request,userId=None):
    if request.method == 'GET':
        adventures = Adventure.objects.filter(owner_id=userId)
        serializer = AdventureSerializer(adventures,many=True)

        return JsonResponse(serializer.data, safe=False)
    
@csrf_exempt
def adventures(request,advId=None):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        user = User.objects.get(pk=int(data["owner"]))
        adv = Adventure(name=data["name"],owner=user)
        adv.save()

        serialized = AdventureSerializer(adv)
        return JsonResponse(serialized.data,safe=False)
        
    elif request.method == "DELETE":
        advToDel = Adventure.objects.get(pk=advId)
        advToDel.delete()
        serialized = AdventureSerializer(advToDel)

        #TODO Probably should return success code instead of object...
        return JsonResponse(serialized.data,safe=False)

def makeGeoJsonFromMap(map):
    features = []

    for segment in map.segments.all():

        coordinates = []
        for coord in segment.coordinates.all():
            coordinates.append([float(coord.lat),float(coord.lng)])
                
        geometry = {"type":"LineString","coordinates":coordinates}
        segmentDict = {"type":"Feature","properties":{"SegmentId":segment.id},"geometry":geometry}
        features.append(segmentDict)

    mapDict = {"type":"FeatureCollection","properties":{"mapId": map.id,"mapName":map.name},"features":features}
        
    return mapDict

@csrf_exempt
def advMaps(request,advId=None):
    if request.method == 'GET':
        maps = Map.objects.filter(adv=advId)
        serializer = MapSerializer(maps, many=True)
        return JsonResponse(serializer.data,safe=False)
        
    if request.method == 'POST':
        data = JSONParser().parse(request)
        adv = Adventure.objects.get(id=int(data["advId"]))
        map = Map(name=data["name"],adv=adv)
        map.save()
        
        serialized =  MapSerializer(map)
        return JsonResponse(serialized.data,safe=False)

@csrf_exempt
def maps(request,mapId=None):
    if request.method == 'GET':
        
        map = Map.objects.filter(id=mapId).first()
        
        results = []
        if map!=None:
            results = makeGeoJsonFromMap(map)
        return JsonResponse(results,safe=False)
        
        #this returns coordinates set
        pass        
    elif request.method == 'DELETE':
        mapToDel = Map.objects.get(id=mapId)
        mapToDel.delete()
        
        serialized = MapSerializer(mapToDel)
        
        return JsonResponse(serialized.data,safe=False)

@csrf_exempt 
def mapSegment(request,segmentId=None):
    if request.method=='POST':
        data = JSONParser().parse(request)
        map = Map.objects.get(id=int(data["mapId"]))
        

        startTime  = None
        endTime = None
        if "startTime" in data.keys():
            startTime = data["startTime"]
        if "endTime" in data.keys():
            endTIme = data["endTime"]
            
        distance = data["distance"]
        waypoints = data["waypoints"]
        
        #create segment
        mapSegment = MapSegment(map=map,
                                startTime=None,
                                endTime=None,
                                distance = None)
        mapSegment.save()
        
        #create waypoints
        for point in waypoints:
            waypointObj = WayPoint(segment = mapSegment,
                                   lat = point[1],
                                   lng = point[0])
            waypointObj.save()
            
        #return custom geoJson
        serialized = MapSegmentSerializer(mapSegment)
        return JsonResponse(serialized.data,safe=False)
    