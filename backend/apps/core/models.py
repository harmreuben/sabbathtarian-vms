import uuid
from django.db import models
from django.utils import timezone

class TimeStampedModel(models.Model):
    """
    Abstract base class providing self-updating created_at and updated_at fields.
    """
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True


class SafeDeleteManager(models.Manager):
    """
    Manager that excludes soft-deleted records by default.
    """
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

    def all_with_deleted(self):
        return super().get_queryset()


class SafeDeleteModel(TimeStampedModel):
    """
    Abstract base model implementing soft delete functionality.
    Prevents actual database deletion to maintain audit trails.
    """
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SafeDeleteManager()
    all_objects = models.Manager() # Access to all records including deleted

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    class Meta:
        abstract = True