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

"""
class SegmentPropertiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SegmentProperties
        fields = ['distance']
"""

class MapSegmentSerializer(serializers.ModelSerializer):
    coordinates = WayPointSerializer(many=True,read_only=True)
    class Meta:
        model = MapSegment
        fields = ('id','coordinates', 'properties')

        
class MapSerializer(serializers.ModelSerializer):
    segments = MapSegmentSerializer(many=True)
    class Meta:
        model = Map
        fields= ['id','name', 'segments']
        
