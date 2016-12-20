from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from django_maps import settings
import os

class ProfilePhotoUploadForm(forms.Form):
    userId = forms.IntegerField()
    file = forms.FileField()

class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2") #can add fields here (firs_name,last_name)
        
    def save(self, commit=True):
        #calling super(RegistrationForm) internally calls set_password
        user = super(RegistrationForm,self).save(commit=False)
        
        if commit:
            user.save()

        #create directory for user media
        target = settings.USER_MEDIA_ROOT+'/'+str(user.id)
        print(target)
        target2 = target + "/profile_pictures"
        os.mkdir(target)
        os.mkdir(target2)
        
        return user
