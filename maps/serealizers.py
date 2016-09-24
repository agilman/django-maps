from maps.models import Adventure, Map, DaySegment, WayPoint

from rest_framework import serializers

class AdventureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adventure
        fields= ['id','name']
        
class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields= ['id','name']
        
class DaySegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DaySegment
        fields = '__all__'
        
class WayPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = WayPoint
        fields= '__all__'