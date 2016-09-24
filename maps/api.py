from maps.models import Adventure, Map
from maps.serealizers import AdventureSerializer, MapSerializer
from django.http import JsonResponse

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

@csrf_exempt
def advMaps(request,advId=None):
    if request.method == 'GET':
        maps = Map.objects.filter(advId=advId)
        serializer = MapSerializer(maps, many=True)
        return JsonResponse(serializer.data,safe=False)
    if request.method == 'POST':
        data = JSONParser().parse(request)
        adv = Adventure.objects.get(id=int(data["advId"]))
        map = Map(name=data["name"],advId=adv)
        map.save()
        
        serialized =  MapSerializer(map)
        return JsonResponse(serialized.data,safe=False)

@csrf_exempt
def maps(request,mapId=None):
    if request.method == 'GET':
        #this returns coordinates set
        pass
    elif request.method == 'DELETE':
        mapToDel = Map.objects.get(id=mapId)
        mapToDel.delete()
        
        serialized = MapSerializer(mapToDel)
        
        return JsonResponse(serialized.data,safe=False)
    

    