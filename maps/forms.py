from django import forms

class ProfilePhotoUploadForm(forms.Form):
    userId = forms.IntegerField()
    file = forms.FileField()
