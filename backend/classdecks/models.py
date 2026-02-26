from django.db import models
import uuid
from django.conf import settings
import os
class Deck(models.Model):
    name=models.CharField(max_length=255)
    description=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    deck_code=models.CharField(max_length=10,unique=True,editable=False)

    teacher=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_decks'
    )

    student=models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='joined_decks',
        blank=True,
    )

    def save(self, *args, **kwargs):
        if not self.deck_code:
            self.deck_code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Module(models.Model):
    title=models.CharField(max_length=25)
    description=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)

    deck=models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name='modules'
    )
    
    def __str__(self):
        return self.title

class ModuleFile(models.Model):
    FILE_TYPE_CHOICES=(
        ('ppt','PPT'),
        ('pdf','PDF'),
    )

    module=models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='files',
    )

    file=models.FileField(upload_to='module_files/')
    converted_pdf=models.FileField(
        upload_to='module_files/converted/',
        blank=True,
        null=True,
    )
    file_type=models.CharField(max_length=15,choices=FILE_TYPE_CHOICES,blank=True)
    uploaded_at=models.DateTimeField(auto_now_add=True)

    def delete(self,*args,**kwargs):
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)

        if self.converted_pdf:
            if os.path.isfile(self.converted_pdf.path):
                os.remove(self.converted_pdf.path)
            
        super().delete(*args,**kwargs)

    def __str__(self):
        return f"{self.module.title}-File"



