from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommunicationTemplateViewSet, CommunicationLogViewSet, SendBroadcastView

router = DefaultRouter()
router.register(r'templates', CommunicationTemplateViewSet)
router.register(r'logs', CommunicationLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('broadcast/send/', SendBroadcastView.as_view(), name='send-broadcast'),
]