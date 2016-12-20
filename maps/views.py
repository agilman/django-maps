from django.shortcuts import render, redirect
from django.contrib.auth.models import User as User_model

from django.contrib.auth import login
from django.http import HttpResponse

#from django.template import Context
from maps import settings
from maps import forms

def getUserIdFromUserName(userName):
    user = User_model.objects.get(username=userName)
    #TODO error handling...
    return user.pk

# Create your views here.
def landing(request):
    if request.user.is_authenticated():
        return render(request, "landing-session.html")
    return render(request,"landing-base.html")

#Main entry to SPA
def profileViewer(request,userName):
    userId = getUserIdFromUserName(userName)

    
    #TODO check if user exists. Return error otherwise.
    if request.user.is_authenticated():
        return render(request,"profile-base-session.html",
                      context={'userId':userId,
                               'userName':userName,
                               'mapboxToken':settings.mapboxToken,
                               'mapboxMap':settings.mapboxMap})
    
    return render(request,"profile-base.html",context={'userId':userId,'userName':userName,'mapboxToken':settings.mapboxToken,'mapboxMap':settings.mapboxMap})


def editorViewer(request):
    context = {'mapboxToken':settings.mapboxToken,
               'mapboxMap':settings.mapboxMap}
    
    return render(request,"editor-base.html",context=context)


def registration(request):
    if request.method == 'POST':
        form = forms.RegistrationForm(request.POST)
        if form.is_valid():
            newUser = form.save()
            #assign session
            login(request,newUser)
            
            return redirect("/")
        else:
            print("invalid shit")
            print(form.is_valid())
            return HttpResponse("Registration error")
    else:

        form = forms.RegistrationForm()
        return render(request,"registration/registration_form.html",{'form':form})
