from django.db import models

from django.conf import settings


# Create your models here.
class Adventure(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,)
    name = models.CharField(max_length=32)

class Map(models.Model):
    adv = models.ForeignKey(Adventure,on_delete=models.CASCADE)
    name = models.CharField(max_length=32)

class MapSegment(models.Model):
    map = models.ForeignKey(Map,on_delete=models.CASCADE, related_name="segments")
    
class WayPoint(models.Model):
    segmentId = models.ForeignKey(MapSegment,on_delete=models.CASCADE, related_name="coordinates")
    Lat = models.DecimalField(max_digits=9, decimal_places=6)
    Lng = models.DecimalField(max_digits=9, decimal_places=6)
    
    def __str__(self):
        return '[%s,%s]' %(self.Lat,self.Lng)
    