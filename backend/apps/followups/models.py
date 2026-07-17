import uuid
from django.db import models
from apps.core.models import SafeDeleteModel
from apps.visitors.models import Visitor
from apps.users.models import User

class FollowUp(SafeDeleteModel):
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        CALLED = 'Called', 'Called'
        VISITED = 'Visited', 'Visited'
        PRAYED_WITH = 'Prayed With', 'Prayed With'
        INTERESTED = 'Interested', 'Interested'
        JOINED = 'Joined Church', 'Joined Church'
        BAPTIZED = 'Baptized', 'Baptized'
        MEMBER = 'Member', 'Member'
        INACTIVE = 'Inactive', 'Inactive'
        NO_RESPONSE = 'No Response', 'No Response'
        LOST_CONTACT = 'Lost Contact', 'Lost Contact'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name='followups')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_followups')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    due_date = models.DateField()
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'followups'
        ordering = ['due_date']

    def __str__(self):
        return f"{self.visitor.full_name} - {self.status}"