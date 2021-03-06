from maps.models import UserProfilePicture, UserBio, Adventure, Map , MapSegment, WayPoint, DayNote
from maps.serealizers import UserProfilePictureSerializer, UserBioSerializer, AdventureSerializer, MapSerializer, MapSegmentSerializer
from maps.forms import ProfilePhotoUploadForm
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

from django_maps import settings

from datetime import datetime
import pytz
import os

@csrf_exempt
def userInfo(request,userId=None):
    if request.method == 'GET':
        adventures = Adventure.objects.filter(owner_id=userId)
        advSerializer = AdventureSerializer(adventures,many=True)

        bio = UserBio.objects.filter(user=userId).first()
        bioSerializer = None

        if type(bio)!=type(None):
            bioSerializer = UserBioSerializer(bio,many=False).data 
            
        userPicture = UserProfilePicture.objects.filter(user=userId)
        userPicData = None

        if type(userPicture)!=type(None):
            userPicData = UserProfilePictureSerializer(userPicture,many=True).data
            
        total = {"adventures":advSerializer.data,"bio":bioSerializer,"profile_pictures":userPicData}        
        return JsonResponse(total, safe=False)
    
    elif request.method == 'POST': #NO PUT,Only POST
        data = JSONParser().parse(request)
        user = User.objects.get(pk=int(data["userId"]))

        #check if exists:
        bioQuery = UserBio.objects.filter(user=user)
        bio = None
        if bioQuery.exists():
            bioQuery.update(bio=data["bio"])

            bio = bioQuery.first()

        else:

            bio = UserBio(user=user,bio=data["bio"])
            bio.save()

        serialized = UserBioSerializer(bio)
        return JsonResponse(serialized.data,safe=False)

def handle_uploaded_file(userId,f):
    #write file as is, convert to decided format, add to db,  delete old ?

    #save file as is
    target = settings.USER_MEDIA_ROOT+'/'+str(userId)+'/profile_pictures/'+f.name

    with open(target, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)

    #convert,resize,thumbs
    
            
    #add to db
    user = User.objects.get(pk=int(userId))
    my_date = datetime.now(pytz.timezone('US/Pacific'))
    profilePicture = UserProfilePicture(user=user,uploadTime=my_date,active=True)
    profilePicture.save()

    #temp solution... need to convert to target file with right extension, and then delete the old file.
    #rename
    newName = settings.USER_MEDIA_ROOT+'/'+str(userId)+'/profile_pictures/'+str(profilePicture.id)+".png"
    os.rename(target,newName)

    
    return profilePicture

@csrf_exempt
def profilePhoto(request):
    if request.method == 'POST':
       
        form = ProfilePhotoUploadForm(request.POST,request.FILES)
        if form.is_valid():
            userId = form.data['userId']
            f = request.FILES['file']
            userPic = handle_uploaded_file(userId,f)
       
            return JsonResponse({"picId":userPic.id},safe=False)
        
@csrf_exempt
def adventures(request,advId=None):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        user = User.objects.get(pk=int(data["owner"]))

        advName = data["name"]
        advType = data["advType"]
        advStatus = data["advStatus"]

        #If advStatus = active, need to unset previous active.
        
        adv = Adventure(name=advName,owner=user,advType=advType,advStatus=advStatus)
        adv.save()

        serialized = AdventureSerializer(adv)
        return JsonResponse(serialized.data,safe=False)
        
    elif request.method == "DELETE":
        advToDel = Adventure.objects.get(pk=advId)
        advToDel.delete()
        serialized = AdventureSerializer(advToDel)

        #TODO Probably should return success code instead of object...
        return JsonResponse(serialized.data,safe=False)

    elif request.method == "PUT":
        data = JSONParser().parse(request)
        owner = User.objects.get(pk=int(data["owner"]))
        
        advName = data["name"]
        advType = data["advType"]
        advStatus = data["advStatus"]

        #If advStatus = active, need to unset previous active.
        
        adv = Adventure(id=advId,name=advName,owner=owner,advType=advType,advStatus=advStatus)
        adv.save()

        serialized = AdventureSerializer(adv)
        return JsonResponse(serialized.data,safe=False)


@csrf_exempt
def advsOverview(request,userId):
    """This returns all start and end points from all the segments in all the maps, for all adventures.
    The goal is to visualize roughly all the travelling the user has done."""
    
    if request.method=="GET":
        allAdvs = []
        #this is awful
        advs = Adventure.objects.filter(owner_id=userId).all()
        for adv in advs:
            advCoordinates = []
            distance = 0
            startTime = None
            endTime = None

            #get startTime
            advMaps = adv.maps.all()
            if advMaps.count()>0:
                startSegments = advMaps[0].segments.all()
                if startSegments.count()>0:
                    startTime = startSegments[0].startTime

                endSegments = advMaps[advMaps.count()-1].segments.all()
                if endSegments.count()>0:
                    endTime = endSegments[endSegments.count()-1].endTime

            
            for advMap in advMaps:
                segments = advMap.segments.all()
                for segment in segments:
                    start = segment.coordinates.first()
                    startPoint = [float(start.lat),float(start.lng)]
                    
                    end = segment.coordinates.last()
                    endPoint = [float(end.lat),float(end.lng)]
                    
                    ###TODO: allow for non-continuous lines? 
                    #Add first segment
                    if len(advCoordinates) == 0:
                        advCoordinates.append(startPoint)
                        advCoordinates.append(endPoint)
                    
                    #If this is not the first segment, check if startPoint is same as last endPoint
                    else:
                        if advCoordinates[len(advCoordinates)-1]==startPoint:  
                            advCoordinates.append(endPoint)
                        else:
                            advCoordinates.append(startPoint)
                            advCoordinates.append(endPoint)
                    
                    distance += segment.distance
            
            advGeoJson = {'type':'Feature',
                          'properties':{'advId':adv.id,
                                        'distance': distance,
                                        'startTime': startTime,
                                        'endTime': endTime},
                          'geometry':{'type':'LineString',
                                      'coordinates': advCoordinates}}
            
            allAdvs.append(advGeoJson)


        adventuresGeoJson = {'type':'FeatureCollection','properties':{'userId':userId},'features': allAdvs}
        
        return JsonResponse(adventuresGeoJson, safe=False)

def makeGeoJsonFromMap(map):
    features = []

    for segment in map.segments.all():

        coordinates = []
        for coord in segment.coordinates.all():
            coordinates.append([float(coord.lat),float(coord.lng)])
                
        geometry = {"type":"LineString","coordinates":coordinates}

        notesResults = segment.dayNotes.first()
        notes = []
        if type(notesResults)!=type(None):
            note = notesResults.note
            notes.append(note)

        segmentDict = {"type":"Feature",
                       "properties": {"segmentId":segment.id,
                                      'distance':segment.distance,
                                      'startTime':segment.startTime,
                                      'endTime':segment.endTime,
                                      'delay': segment.delay,
                                      'notes':notes},
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
    notes = []
    for notesObj in segment.dayNotes.all():
        notes.append(notesObj.note)
        
    feature = {"type":"Feature",
               "properties":{"segmentId": segment.id,
                             "distance": segment.distance,
                             "delay": segment.delay,
                             "notes": notes,
                             'startTime':segment.startTime,
                             'endTime':segment.endTime},
               "geometry":geometry}
    
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

        #Hmm, maybe I should just get a serializer...
        result = {"id":map.id,"name":map.name,"features":[],"distance":0 }    
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
                endTime = data["endTime"]
            
            distance = data["distance"]
            waypoints = data["waypoints"]
            if 'dayNotes' in data.keys():
                dayNotes = data['dayNotes']               

            delay = data['delay']
            
            #create segment
            mapSegment = MapSegment(map=map,
                                    startTime=startTime,
                                    endTime=endTime,
                                    distance = distance,
                                    delay=delay)
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
