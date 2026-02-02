from django.db import models
import os

class EquipmentDataset(models.Model):
    file = models.FileField(upload_to='datasets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dataset uploaded at {self.uploaded_at}"

    def delete(self, *args, **kwargs):
        # Clean up file on delete
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
