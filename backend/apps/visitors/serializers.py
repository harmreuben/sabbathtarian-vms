from rest_framework import serializers
from .models import Visitor

class VisitorSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    service_name = serializers.CharField(source='service_attended.name', read_only=True)
    registered_by_name = serializers.CharField(source='registered_by.username', read_only=True)

    class Meta:
        model = Visitor
        fields = '__all__'
        read_only_fields = ('id', 'registration_number', 'qr_code_hash', 'registered_by', 'created_at', 'updated_at', 'is_deleted', 'deleted_at')