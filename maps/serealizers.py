from maps.models import Adventures

from rest_framework import serializers

class AdventureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adventures
        fields= ['id','name']
    