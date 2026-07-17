from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django.core.exceptions import ValidationError
from .models import Attendance, ScanLog
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
        code = request.data.get('code')
        service_id = request.data.get('service')
        device_info = request.META.get('HTTP_USER_AGENT', 'Unknown Device')
        ip_address = request.META.get('REMOTE_ADDR')

        if not code or not service_id:
            return Response(
                {"error": "Both 'code' and 'service' are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        visitor = None
        try:
            visitor = Visitor.objects.filter(
                models.Q(registration_number=code) | models.Q(qr_code_hash=code)
            ).first()
        except ValidationError:
            visitor = Visitor.objects.filter(registration_number=code).first()

        # 1. Invalid Scan Log
        if not visitor:
            ScanLog.objects.create(
                status=ScanLog.Status.INVALID, 
                device_info=device_info, 
                ip_address=ip_address
            )
            return Response(
                {"error": "Invalid QR Code. Visitor not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Revoked QR Code Check
        if not visitor.is_qr_active:
            ScanLog.objects.create(
                visitor=visitor, 
                status=ScanLog.Status.REVOKED, 
                device_info=device_info, 
                ip_address=ip_address
            )
            return Response(
                {"error": "This QR code has been revoked. Please see an administrator."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 3. Duplicate Check
        already_checked_in = Attendance.objects.filter(
            visitor=visitor, 
            service_id=service_id
        ).exists()

        if already_checked_in:
            ScanLog.objects.create(
                visitor=visitor, 
                status=ScanLog.Status.DUPLICATE, 
                device_info=device_info, 
                ip_address=ip_address
            )
            return Response(
                {"warning": f"{visitor.full_name} is already checked in to this service."}, 
                status=status.HTTP_409_CONFLICT
            )

        # 4. Success
        attendance = Attendance.objects.create(
            visitor=visitor,
            service_id=service_id,
            checked_in_by=request.user
        )

        ScanLog.objects.create(
            visitor=visitor, 
            status=ScanLog.Status.SUCCESS, 
            device_info=device_info, 
            ip_address=ip_address
        )
        
        serializer = self.get_serializer(attendance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)