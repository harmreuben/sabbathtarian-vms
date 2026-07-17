from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from django.core.exceptions import ValidationError
from .models import Attendance
from .serializers import AttendanceSerializer
from apps.visitors.models import Visitor

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['service', 'visitor', 'check_in_time']

    def perform_create(self, serializer):
        serializer.save(checked_in_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='scan')
    def scan_check_in(self, request):
        """
        Custom endpoint to check-in a visitor via QR hash or Registration Number.
        Expects: {"code": "VIS-20260704-0001", "service": "uuid-of-service"}
        """
        code = request.data.get('code')
        service_id = request.data.get('service')
        
        if not code or not service_id:
            return Response(
                {"error": "Both 'code' and 'service' are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        visitor = None
        try:
            # Try to find visitor by Registration Number or QR Hash
            visitor = Visitor.objects.filter(
                models.Q(registration_number=code) | models.Q(qr_code_hash=code)
            ).first()
        except ValidationError:
            # If the code is not a valid UUID, it just means it's not a qr_code_hash.
            # We only need to search by registration_number.
            visitor = Visitor.objects.filter(registration_number=code).first()

        if not visitor:
            return Response(
                {"error": "Visitor not found. Please register them first."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if already checked in
        already_checked_in = Attendance.objects.filter(
            visitor=visitor, 
            service_id=service_id
        ).exists()

        if already_checked_in:
            return Response(
                {"warning": f"{visitor.full_name} is already checked in to this service."}, 
                status=status.HTTP_409_CONFLICT
            )

        # Create attendance record
        attendance = Attendance.objects.create(
            visitor=visitor,
            service_id=service_id,
            checked_in_by=request.user
        )
        
        serializer = self.get_serializer(attendance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)