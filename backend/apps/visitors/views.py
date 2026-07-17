from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Visitor
from .serializers import VisitorSerializer

class IsReceptionistOrAbove(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['ADMIN', 'PASTOR', 'RECEPTIONIST', 'FOLLOWUP']

class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [permissions.IsAuthenticated, IsReceptionistOrAbove]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'county', 'branch', 'visitor_type', 'marital_status']
    search_fields = ['full_name', 'phone_number', 'email', 'registration_number']
    ordering_fields = ['created_at', 'full_name']

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the registrar
        serializer.save(registered_by=self.request.user)