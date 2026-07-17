from rest_framework import viewsets, permissions
from .models import Branch, Service
from .serializers import BranchSerializer, ServiceSerializer

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated]

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]