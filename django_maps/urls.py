"""django_maps URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from maps import views
from maps import api

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$',views.landing),
    
    url(r'^auth/', include("registration.backends.simple.urls")),
    
    url(r'^users/(?P<userName>[\w\-]+)/adventures/$',views.advViewer),
    
    #Editor URLs
    url(r'^editor$', views.advEditorViewer),
    
    
    #API URLs
    url(r'^api/rest/adventures/(?P<userId>\d+)$', api.adventures),
]
