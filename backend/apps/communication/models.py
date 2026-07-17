import uuid
from django.db import models
from apps.core.models import SafeDeleteModel
from apps.visitors.models import Visitor
from apps.users.models import User

class CommunicationTemplate(SafeDeleteModel):
    class Channel(models.TextChoices):
        SMS = 'SMS', 'SMS'
        WHATSAPP = 'WHATSAPP', 'WhatsApp'
        EMAIL = 'EMAIL', 'Email'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    channel = models.CharField(max_length=10, choices=Channel.choices)
    subject = models.CharField(max_length=200, blank=True) # For Email
    body = models.TextField(help_text="Use {{name}} for visitor's name")

    def __str__(self):
        return f"{self.name} ({self.channel})"

class CommunicationLog(SafeDeleteModel):
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        SENT = 'Sent', 'Sent'
        FAILED = 'Failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name='messages')
    sent_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_messages')
    channel = models.CharField(max_length=10, choices=CommunicationTemplate.Channel.choices)
    message_body = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    error_message = models.TextField(blank=True, null=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'communication_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.visitor.full_name} - {self.channel} - {self.status}"