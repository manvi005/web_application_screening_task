from rest_framework import serializers
from .models import EquipmentDataset

class EquipmentDatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentDataset
        fields = ['id', 'file', 'uploaded_at']
        read_only_fields = ['uploaded_at']
