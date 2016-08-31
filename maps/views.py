from django.shortcuts import render

#from django.http import HttpResponse
# Create your views here.
def landing(request):
    if request.user.is_authenticated():
        return render(request, "landingSession.html")
    #return HttpResponse("Hello World!")
    return render(request,"landing.html")