from django.shortcuts import render
#from django.http import HttpResponse
# Create your views here.
def landing(request):
    
    #return HttpResponse("Hello World!")
    return render(request,"landing.html")