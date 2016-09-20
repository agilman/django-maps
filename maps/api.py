from maps.models import Adventures
from maps.serealizers import AdventureSerializer
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
def adventures(request,userId=None):
    if request.method == 'GET':
        adventures = Adventures.objects.filter(owner_id=userId)
        serializer = AdventureSerializer(adventures,many=True)

        return JsonResponse(serializer.data, safe=False)

    elif request.method == 'POST':        
        data = JSONParser().parse(request)
        user = User.objects.get(pk=int(data["owner"]))
        adv = Adventures(name=data["name"],owner=user)
        adv.save()

        serialized = AdventureSerializer(adv)
        return JsonResponse(serialized.data,safe=False)
        
    elif request.method == "DELETE":
        advId = userId #This is because of the url mapping...
        advToDel = Adventures.objects.get(pk=advId)
        advToDel.delete()
        serialized = AdventureSerializer(advToDel)

        #TODO Probably should return success code instead of object...
        return JsonResponse(serialized.data,safe=False)
