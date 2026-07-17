from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BranchViewSet, ServiceViewSet

router = DefaultRouter()
router.register(r'branches', BranchViewSet)
router.register(r'services', ServiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]