from django.shortcuts import render
from django.contrib.auth.models import User
#from django.template import Context

def getLatestAdv(userId):
    return 1

def getUserIdFromUserName(userName):
    user = User.objects.get(username=userName)
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
        return render(request,"profile-base-session.html",context={'userId':userId,'userName':userName})
    return render(request,"profile-base.html",context={'userId':userId,'userName':userName})


def editorViewer(request):
    return render(request,"editor-base.html")
