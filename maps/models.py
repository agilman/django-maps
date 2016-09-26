from django.db import models

from django.conf import settings

# Create your models here.
class Adventure(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,)
    name = models.CharField(max_length=32)

class Map(models.Model):
    advId = models.ForeignKey(Adventure,on_delete=models.CASCADE)
    name = models.CharField(max_length=32)

class MapSegment(models.Model):
    mapId = models.ForeignKey(Map,on_delete=models.CASCADE)
    startTime = models.DateTimeField(null=True)
    endTime = models.DateTimeField(null = True)
    startLat = models.DecimalField(max_digits=9, decimal_places=6)
    startLng = models.DecimalField(max_digits=9, decimal_places=6)
    endLat = models.DecimalField(max_digits=9, decimal_places=6)
    endLng = models.DecimalField(max_digits=9, decimal_places=6)
    distance = models.IntegerField(null=True)

class WayPoint(models.Model):
    segmentId = models.ForeignKey(MapSegment,on_delete=models.CASCADE)
    Lat = models.DecimalField(max_digits=9, decimal_places=6)
    Lng = models.DecimalField(max_digits=9, decimal_places=6)
