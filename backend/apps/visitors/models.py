import uuid
from django.db import models
from django.utils import timezone
from apps.core.models import SafeDeleteModel
from apps.church.models import Branch, Service
from apps.users.models import User

class Visitor(SafeDeleteModel):
    GENDER_CHOICES = [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')]
    MARITAL_STATUS_CHOICES = [('Single', 'Single'), ('Married', 'Married'), ('Divorced', 'Divorced'), ('Widowed', 'Widowed')]
    VISITOR_TYPE_CHOICES = [('First Time', 'First Time'), ('Returning', 'Returning')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration_number = models.CharField(max_length=50, unique=True, editable=False, db_index=True)
    qr_code_hash = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Personal Details
    full_name = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    age = models.PositiveIntegerField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True)
    occupation = models.CharField(max_length=150, blank=True)
    national_id = models.CharField(max_length=50, blank=True, null=True)
    
    # Contact Details
    phone_number = models.CharField(max_length=20)
    alternative_phone = models.CharField(max_length=20, blank=True, null=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    physical_address = models.TextField(blank=True)
    
    # Location Details
    country = models.CharField(max_length=100, default='Kenya')
    county = models.CharField(max_length=100, blank=True)
    sub_county = models.CharField(max_length=100, blank=True)
    ward = models.CharField(max_length=100, blank=True)
    village = models.CharField(max_length=100, blank=True)
    
    # Visit Details
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)
    service_attended = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    visitor_type = models.CharField(max_length=20, choices=VISITOR_TYPE_CHOICES, default='First Time')
    invited_by = models.CharField(max_length=255, blank=True, null=True)
    name_of_inviter = models.CharField(max_length=255, blank=True, null=True)
    purpose_of_visit = models.TextField(blank=True)
    seat_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Family & Additional Info
    spouse_name = models.CharField(max_length=255, blank=True, null=True)
    children = models.TextField(blank=True, help_text="Names and ages of children")
    special_needs = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    
    # Spiritual & Follow-up
    prayer_request = models.TextField(blank=True)
    remarks = models.TextField(blank=True)
    
    # Consents
    consent_sms = models.BooleanField(default=False)
    consent_whatsapp = models.BooleanField(default=False)
    consent_email = models.BooleanField(default=False)
    
    # System Fields
    registered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='registered_visitors')
    gps_location = models.CharField(max_length=100, blank=True, null=True, help_text="Stored as 'lat, lng' string")
    is_qr_active = models.BooleanField(default=True, help_text="Set to False to revoke a compromised QR code")

    class Meta:
        db_table = 'visitors'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.registration_number:
            today = self.created_at or timezone.now()
            prefix = f"VIS-{today.strftime('%Y%m%d')}"
            last_visitor = Visitor.objects.filter(registration_number__startswith=prefix).order_by('-registration_number').first()
            if last_visitor:
                last_num = int(last_visitor.registration_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            self.registration_number = f"{prefix}-{new_num:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.registration_number})"