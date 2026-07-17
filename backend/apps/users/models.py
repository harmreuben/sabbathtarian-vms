import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import TimeStampedModel

class User(TimeStampedModel, AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Implements UUID primary keys and Role-Based Access Control (RBAC).
    """
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrator'
        PASTOR = 'PASTOR', 'Pastor/Elder'
        RECEPTIONIST = 'RECEPTIONIST', 'Receptionist'
        SECURITY = 'SECURITY', 'Security Personnel'
        FOLLOWUP = 'FOLLOWUP', 'Follow-up Team'
        MEDIA = 'MEDIA', 'Media Team'
        READONLY = 'READONLY', 'Read-only User'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=20, 
        choices=Roles.choices, 
        default=Roles.READONLY
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Explicitly define related_names to avoid clashes with Django's default auth system
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"