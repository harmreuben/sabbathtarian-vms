import uuid
from django.db import models
from apps.core.models import TimeStampedModel

class Branch(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    county = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'branches'
        ordering = ['name']

    def __str__(self):
        return self.name

class Service(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255) # e.g., Sabbath Service, Bible Study
    day_of_week = models.CharField(max_length=20, blank=True) # e.g., Saturday
    start_time = models.TimeField()

    class Meta:
        db_table = 'services'
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.branch.name} - {self.name}"