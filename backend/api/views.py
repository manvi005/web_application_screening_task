from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EquipmentDataset
from .serializers import EquipmentDatasetSerializer
import pandas as pd
from django.conf import settings
import os
from reportlab.pdfgen import canvas
from django.http import HttpResponse

class DatasetViewSet(viewsets.ModelViewSet):
    queryset = EquipmentDataset.objects.all().order_by('-uploaded_at')
    serializer_class = EquipmentDatasetSerializer

    def create(self, request, *args, **kwargs):
        # Implementation to limit history to 5
        # First creating the new one
        response = super().create(request, *args, **kwargs)
        
        # Then checking count and deleting old ones
        datasets = EquipmentDataset.objects.all().order_by('-uploaded_at')
        if datasets.count() > 5:
            for dataset in datasets[5:]:
                dataset.delete()
                
        return response

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        dataset = self.get_object()
        try:
            df = pd.read_csv(dataset.file.path)
            
            # Basic validation of columns
            required_columns = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
            if not all(col in df.columns for col in required_columns):
                return Response({'error': 'Missing required columns'}, status=status.HTTP_400_BAD_REQUEST)

            stats = {
                'total_count': len(df),
                'average_flowrate': df['Flowrate'].mean(),
                'average_pressure': df['Pressure'].mean(),
                'average_temperature': df['Temperature'].mean(),
                'type_distribution': df['Type'].value_counts().to_dict(),
                'data': df.to_dict(orient='records') # sending raw data for table
            }
            return Response(stats)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        dataset = self.get_object()
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="report_{pk}.pdf"'

        try:
            df = pd.read_csv(dataset.file.path)
            p = canvas.Canvas(response)
            
            p.drawString(100, 800, f"Equipment Parameter Report - Dataset {pk}")
            p.drawString(100, 780, f"Total Equipment: {len(df)}")
            p.drawString(100, 760, f"Avg Flowrate: {df['Flowrate'].mean():.2f}")
            p.drawString(100, 740, f"Avg Pressure: {df['Pressure'].mean():.2f}")
            p.drawString(100, 720, f"Avg Temperature: {df['Temperature'].mean():.2f}")
            
            p.drawString(100, 690, "Type Distribution:")
            y = 670
            for type_name, count in df['Type'].value_counts().items():
                p.drawString(120, y, f"{type_name}: {count}")
                y -= 20
                
            p.showPage()
            p.save()
            return response
        except Exception as e:
             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
