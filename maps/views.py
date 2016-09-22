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
        return render(request, "landingSession.html")
    return render(request,"landing.html")

#Main entry to SPA
def advSelectionViewer(request,userName):
    userId = getUserIdFromUserName(userName)

    #TODO check if user exists. Return error otherwise.
    if request.user.is_authenticated():
        return render(request,"advSelectionViewer-session.html",context={'userId':userId,'userName':userName})
    return render(request,"advSelectionViewer.html",context={'userId':userId,'userName':userName})

def advViewer(request,userName,advId):
    userId = getUserIdFromUserName(userName)
    if request.user.is_authenticated():
        return render(request,"advViewer-session.html",context={'userId':userId,'advId':advId})
    return render(request,"advViewer.html",context={'userId':userId,'advId':advId})

def mapsView(request,userName,advId=None):
    userId = getUserIdFromUserName(userName)
    if type(advId)==type(None):
        advId = getLatestAdv(userId)
    if request.user.is_authenticated():
        return render(request,"mapsView-session.html",context={'userId':userId,'advId':advId})
    return render(request,"mapsView.html",context={'userId':userId,'advId':advId})

def blogsView(request,userName,advId=None):
    userId = getUserIdFromUserName(userName)
    if type(advId)==type(None):
        advId = getLatestAdv(userId)
        
    if request.user.is_authenticated():
        return render(request,"blogsView-session.html",contest={'userId':userId,'advId':advId})
    return render(request,"blogsView.html",contest={'userId':userId,'advId':advId})
    
def gearListView(request,userName,advId=None):
    userId = getUserIdFromUserName(userName)
    if type(advId)==type(None):
        advId = getLatestAdv(userId)
            
    if request.user.is_authenticated():
        return render(request,"gearListView-session.html",contest={'userId':userId,'advId':advId})
    return render(request,"gearListView.html",contest={'userId':userId,'advId':advId})
    

def advEditorViewer(request):
    return render(request,"advEditor.html")
