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
    
    #This will be entry point to SPA
    url(r'^users/(?P<userName>[\w\-]+)/adventures/$',views.profileViewer),
    
    #Editor SPA
    url(r'^editor$', views.editorViewer),
    
    #API URLs
    url(r'^api/rest/userInfo/(?P<userId>\d+)$', api.userInfo), #get only
    url(r'^api/rest/adventures$', api.adventures), #post
    url(r'^api/rest/advsOverview/(?P<userId>\d+)$', api.advsOverview), #get
    url(r'^api/rest/adventures/(?P<advId>\d+)$', api.adventures), #get, delete
    url(r'^api/rest/advMaps/(?P<advId>\d+)$', api.advMaps),
    url(r'^api/rest/maps/(?P<mapId>\d+)$', api.maps),
    url(r'^api/rest/mapSegment$', api.mapSegment), #post
    
]
