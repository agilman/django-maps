from maps.models import Adventures

from rest_framework import serializers

class AdventureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adventures
        fields= ['id','name']
    
    """
    def create(self, validated_data):
        
        
        return Adventures.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name',instance.name)
        instance.save()
        return instance
    """
            
        
    