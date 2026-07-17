from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CommunicationTemplate, CommunicationLog
from .serializers import CommunicationTemplateSerializer, CommunicationLogSerializer
from apps.visitors.models import Visitor
from .tasks import send_bulk_sms_task

class CommunicationTemplateViewSet(viewsets.ModelViewSet):
    queryset = CommunicationTemplate.objects.all()
    serializer_class = CommunicationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

class CommunicationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CommunicationLog.objects.all()
    serializer_class = CommunicationLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['visitor__full_name', 'message_body']

class SendBroadcastView(APIView):
    """
    API Endpoint to send an SMS to a list of visitors asynchronously.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        visitor_ids = request.data.get('visitor_ids', [])

        if not message or not visitor_ids:
            return Response(
                {"error": "Message and visitor_ids are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Create Communication Logs (Status: Pending)
        logs = []
        for vid in visitor_ids:
            try:
                visitor = Visitor.objects.get(id=vid)
                log = CommunicationLog.objects.create(
                    visitor=visitor,
                    sent_by=request.user,
                    channel='SMS',
                    message_body=message,
                    status=CommunicationLog.Status.PENDING
                )
                logs.append(log.id)
            except Visitor.DoesNotExist:
                continue

        # 2. Trigger Celery Task to send SMS in background
        if logs:
            send_bulk_sms_task.delay(logs)

        return Response(
            {"success": f"Broadcast queued for {len(logs)} visitors."}, 
            status=status.HTTP_202_ACCEPTED
        )