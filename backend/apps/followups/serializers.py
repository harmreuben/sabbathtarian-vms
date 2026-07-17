from rest_framework import serializers
from .models import FollowUp

class FollowUpSerializer(serializers.ModelSerializer):
    visitor_name = serializers.CharField(source='visitor.full_name', read_only=True)
    visitor_phone = serializers.CharField(source='visitor.phone_number', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = FollowUp
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at', 'completed_at')