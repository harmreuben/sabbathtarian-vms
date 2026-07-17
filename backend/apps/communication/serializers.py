from rest_framework import serializers
from .models import CommunicationTemplate, CommunicationLog

class CommunicationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunicationTemplate
        fields = '__all__'

class CommunicationLogSerializer(serializers.ModelSerializer):
    visitor_name = serializers.CharField(source='visitor.full_name', read_only=True)
    sent_by_name = serializers.CharField(source='sent_by.username', read_only=True)

    class Meta:
        model = CommunicationLog
        fields = '__all__'
        read_only_fields = ('id', 'status', 'error_message', 'sent_at', 'sent_by', 'created_at', 'updated_at', 'is_deleted', 'deleted_at')