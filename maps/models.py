from django.db import models

from django.conf import settings

# Create your models here.
class Adventures(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,)
    name = models.CharField(max_length=32)
