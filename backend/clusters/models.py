from django.db import models
from pgvector.django import VectorField
from classdecks.models import Module,ModuleFile,Deck
from django.conf import settings

class Doubt(models.Model):
    text=models.TextField()
    embedding=VectorField(dimensions=384)
    module=models.ForeignKey(Module,on_delete=models.CASCADE)
    module_file=models.ForeignKey(ModuleFile,on_delete=models.CASCADE)
    slide_number=models.IntegerField()
    
    student=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doubts'
    )
    cluster=models.ForeignKey(
        'DoubtCluster',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doubts'
    )
    created_at=models.DateTimeField(auto_now_add=True)

class DoubtCluster(models.Model):
    module=models.ForeignKey(Module,on_delete=models.CASCADE)
    slide_number=models.IntegerField()
    summary=models.TextField(blank=True)
    teacher_response=models.TextField(blank=True)
    centeroid_embedding=VectorField(dimensions=384)
    resolved=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

class DoubtResponse(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_notifications"
    )

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_notifications"
    )

    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name="deck_notifications",
        related_query_name="deck_notification"
    )

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="module_notifications",
        related_query_name="module_notification"
    )

    cluster = models.ForeignKey(
        "DoubtCluster",
        on_delete=models.CASCADE,
        related_name="cluster_notifications",
        related_query_name="cluster_notification"
    )

    summary = models.TextField()
    teacher_response = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response for {self.student.username}"


