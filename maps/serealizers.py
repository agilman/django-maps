from maps.models import Adventure, Map, MapSegment, WayPoint

from rest_framework import serializers

class AdventureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adventure
        fields= ['id','name']
        
class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields= ['id','name']
        
class MapSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapSegment
        fields = '__all__'
        
class WayPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = WayPoint
        fields= '__all__'