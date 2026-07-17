from celery import shared_task
from django.utils import timezone
from .models import CommunicationLog
from .providers import get_sms_provider

@shared_task
def send_bulk_sms_task(log_ids):
    """
    Processes a list of CommunicationLog IDs and sends SMS via the active provider.
    """
    provider = get_sms_provider()
    
    for log_id in log_ids:
        try:
            log = CommunicationLog.objects.get(id=log_id)
            if log.channel == 'SMS':
                # Call the provider (mocked for now)
                response = provider.send_sms(log.visitor.phone_number, log.message_body)
                
                if response.get("status") == "Sent":
                    log.status = CommunicationLog.Status.SENT
                    log.sent_at = timezone.now()
                else:
                    log.status = CommunicationLog.Status.FAILED
                    log.error_message = "Provider returned failure"
                log.save()
                
        except Exception as e:
            # Catch network errors or unexpected issues
            log = CommunicationLog.objects.get(id=log_id)
            log.status = CommunicationLog.Status.FAILED
            log.error_message = str(e)
            log.save()