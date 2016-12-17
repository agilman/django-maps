from maps.models import UserBio, Adventure, Map, MapSegment, WayPoint

from rest_framework import serializers

class UserBioSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBio
        fields = ['bio']
        
class AdventureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adventure
        fields= ['id','name']
        
class WayPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = WayPoint 
        fields = ('Lat','Lng')


class MapSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapSegment
        fields = ['id']

        
class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields= ['id','name']
        
