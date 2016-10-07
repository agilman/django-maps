from django.db import models

from django.conf import settings


# Create your models here.
class Adventure(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,)
    name = models.CharField(max_length=32)

class Map(models.Model):
    adv = models.ForeignKey(Adventure,on_delete=models.CASCADE,related_name="maps")
    name = models.CharField(max_length=32)
    
    def total_distance(self):
        return self.segments.all().aggregate(models.Sum('distance'))['distance__sum']
        
class MapSegment(models.Model):
    map = models.ForeignKey(Map,on_delete=models.CASCADE, related_name="segments")
    startTime = models.DateTimeField(null=True)
    endTime = models.DateTimeField(null=True)
    distance = models.IntegerField()
    delay = models.IntegerField()
    
class WayPoint(models.Model):
    segment = models.ForeignKey(MapSegment,on_delete=models.CASCADE, related_name="coordinates")
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    
    def __str__(self):
        return '[%s,%s]' %(self.lat,self.lng)

class DayNote(models.Model):
    segment = models.ForeignKey(MapSegment,on_delete=models.CASCADE, related_name="dayNotes")
    note = models.CharField(max_length=512)
    
