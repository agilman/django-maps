from maps.models import Adventure, Map , MapSegment, WayPoint, DayNote
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

        segmentDict = {"type":"Feature",
                       "properties": {"segmentId":segment.id,
                                      'distance':segment.distance,
                                      'startTime':segment.startTime,
                                      'endTime':segment.endTime},
                       "geometry":geometry}
        features.append(segmentDict)

    mapDict = {"type":"FeatureCollection","properties":{"mapId": map.id,"mapName":map.name},"features":features}
        
    return mapDict

#TODO : Use  makeGeoJsonFromSegment inside makeGeoJsonFromMap...
def makeGeoJsonFromSegment(segment):
    coordinates = []
    for coord in segment.coordinates.all():
        coordinates.append([float(coord.lat),float(coord.lng)])
    
    geometry = {"type":"LineString","coordinates":coordinates}
        
    feature = {"type":"Feature","properties":{"segmentId":segment.id},"geometry":geometry}
    return feature

@csrf_exempt
def advMaps(request,advId=None):
    if request.method == 'GET':
        queryset = Map.objects.filter(adv=advId)
        results = []
        for i in queryset.all():
            myMap = {"id":i.id,"name":i.name,"distance":i.total_distance()}
            results.append(myMap)
            
        return JsonResponse(results,safe=False)

    #TODO This should move to /api/rest/maps
    if request.method == 'POST':
        data = JSONParser().parse(request)
        adv = Adventure.objects.get(id=int(data["advId"]))
        map = Map(name=data["name"],adv=adv)
        
        map.save()
        
        result = {"id":map.id,"name":map.name,"distance":0 }    
        return JsonResponse(result,safe=False)

@csrf_exempt
def maps(request,mapId=None):
    if request.method == 'GET':
        
        map = Map.objects.filter(id=mapId).first()
        
        results = []
        if map!=None:
            results = makeGeoJsonFromMap(map)
        return JsonResponse(results,safe=False)
     
    elif request.method == 'DELETE':
        mapToDel = Map.objects.get(id=mapId)
        mapToDel.delete()
        
        serialized = MapSerializer(mapToDel)
        
        return JsonResponse(serialized.data,safe=False)

@csrf_exempt 
def mapSegment(request,segmentId=None):
    if request.method=='POST':
        data = JSONParser().parse(request)
        #Try validation with serializers...
        
        if "mapId" in data.keys() and data["mapId"] is not None:
            map = Map.objects.get(id=int(data["mapId"]))

            startTime  = None
            endTime = None
            dayNotes = None
            if "startTime" in data.keys():
                startTime = data["startTime"]
            if "endTime" in data.keys():
                endTIme = data["endTime"]
            
            distance = data["distance"]
            waypoints = data["waypoints"]
            if 'dayNotes' in data.keys():
                dayNotes = data['dayNotes']
               
        
            #create segment
            mapSegment = MapSegment(map=map,
                                startTime=None,
                                endTime=None,
                                distance = distance)
            mapSegment.save()

            if dayNotes:
                dayNoteObj = DayNote(segment = mapSegment,note = dayNotes)
                dayNoteObj.save()
                
            #create waypoints
            for point in waypoints:
                waypointObj = WayPoint(segment = mapSegment,
                                   lat = point[1],
                                   lng = point[0])
                waypointObj.save()
            
        #return custom geoJson
            result = makeGeoJsonFromSegment(mapSegment)
        
            return JsonResponse(result,safe=False)
        else:
            return JsonResponse({"error":"Bad input"})
