from maps.models import Adventures
from maps.serealizers import AdventureSerializer
from django.http import JsonResponse

###REST 
#from django.shortcuts import render
#from django.http import HttpResponse
from django.http import HttpRequest
from rest_framework.renderers import JSONRenderer
#from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt

class JSONResponse(HttpRequest):
    """
    Copy + Paste from tutorial
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

        
@csrf_exempt
def adventures(request):
    if request.method == 'GET':
        #adv = Adventures.objects.all()
        #serializer = AdventureSerializer(adv, many=True)
        return JsonResponse({'a':1})
    