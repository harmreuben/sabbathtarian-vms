from rest_framework import serializers
from .models import Attendance
from apps.visitors.models import Visitor

class AttendanceSerializer(serializers.ModelSerializer):
    visitor_name = serializers.CharField(source='visitor.full_name', read_only=True)
    visitor_reg = serializers.CharField(source='visitor.registration_number', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ('id', 'checked_in_by', 'check_in_time', 'is_deleted', 'deleted_at')