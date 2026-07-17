import uuid
from django.db import models
from apps.core.models import SafeDeleteModel
from apps.visitors.models import Visitor
from apps.church.models import Service
from apps.users.models import User

class Attendance(SafeDeleteModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name='attendances')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='attendances')
    checked_in_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='checked_in_attendances')
    check_in_time = models.DateTimeField(auto_now_add=True)
    seat_number = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'attendance'
        ordering = ['-check_in_time']
        # Prevent checking in the same person to the same service twice
        constraints = [
            models.UniqueConstraint(
                fields=['visitor', 'service'],
                condition=models.Q(is_deleted=False),
                name='unique_visitor_per_service'
            )
        ]

    def __str__(self):
        return f"{self.visitor.full_name} - {self.service.name}"

class ScanLog(SafeDeleteModel):
    class Status(models.TextChoices):
        SUCCESS = 'Success', 'Success'
        DUPLICATE = 'Duplicate', 'Duplicate'
        INVALID = 'Invalid', 'Invalid'
        REVOKED = 'Revoked', 'Revoked'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visitor = models.ForeignKey(Visitor, on_delete=models.SET_NULL, null=True, blank=True, related_name='scan_logs')
    status = models.CharField(max_length=20, choices=Status.choices)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_info = models.CharField(max_length=255, blank=True)
    scanned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scan_logs'
        ordering = ['-scanned_at']

    def __str__(self):
        return f"{self.status} - {self.scanned_at}"