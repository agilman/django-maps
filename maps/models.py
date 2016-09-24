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
    #child relationship to day segments
    #daySegments  =

class DaySegment(models.Model):
    mapId = models.ForeignKey(Map,on_delete=models.CASCADE)
    startTime = models.DateTimeField()
    endTime = models.DateTimeField()
    startLat = models.DecimalField(max_digits=9, decimal_places=6)
    startLng = models.DecimalField(max_digits=9, decimal_places=6)
    finishLat = models.DecimalField(max_digits=9, decimal_places=6)
    finishLng = models.DecimalField(max_digits=9, decimal_places=6)
    distance = models.IntegerField

class WayPoint(models.Model):
    segmentId = models.ForeignKey(DaySegment,on_delete=models.CASCADE)
    Lat = models.DecimalField(max_digits=9, decimal_places=6)
    Lng = models.DecimalField(max_digits=9, decimal_places=6)