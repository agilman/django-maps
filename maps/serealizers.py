from maps.models import Adventure, Map, MapSegment, WayPoint

from rest_framework import serializers

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
        
