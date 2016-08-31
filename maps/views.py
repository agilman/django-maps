from django.shortcuts import render

# Create your views here.
def landing(request):
    if request.user.is_authenticated():
        return render(request, "landingSession.html")
    return render(request,"landing.html")

def advViewer(request,userName):
    print(userName)
    #TODO check if user exists. Return error otherwise.
    if request.user.is_authenticated():
        return render(request,"advViewerSession.html")
    return render(request,"advViewer.html")