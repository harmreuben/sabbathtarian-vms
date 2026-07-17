from rest_framework import serializers
from .models import Branch, Service

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    
    class Meta:
        model = Service
        fields = '__all__'