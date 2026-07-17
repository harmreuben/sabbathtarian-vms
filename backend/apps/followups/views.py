from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import FollowUp
from .serializers import FollowUpSerializer

class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all()
    serializer_class = FollowUpSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'assigned_to', 'visitor']
    search_fields = ['visitor__full_name', 'visitor__phone_number']
    ordering_fields = ['due_date', 'created_at']