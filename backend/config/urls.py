from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/', include('apps.church.urls')),
    path('api/v1/', include('apps.visitors.urls')),
    path('api/v1/', include('apps.attendance.urls')),
    path('api/v1/', include('apps.followups.urls')),
    path('api/v1/communication/', include('apps.communication.urls')),
    path('api/v1/reports/', include('apps.reports.urls')), # Make sure this line exists!
]