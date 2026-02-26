from rest_framework import serializers
from .models import Doubt,DoubtCluster,DoubtResponse
class SubmitDoubtSerializer(serializers.Serializer):
    text=serializers.CharField()
    module_file_id=serializers.IntegerField()
    slide_number=serializers.IntegerField()

    def validate_text(self,value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Doubt Too Short")
        return value

class DoubtSerializer(serializers.ModelSerializer):
    class Meta:
        model=Doubt
        fields=["id","text","slide_number","created_at"]

class DoubtClusterSerializer(serializers.ModelSerializer):
    doubts = DoubtSerializer(many=True, read_only=True)

    module = serializers.SerializerMethodField()

    class Meta:
        model = DoubtCluster
        fields = [
            "id",
            "module",
            "slide_number",
            "summary",
            "teacher_response",
            "resolved",
            "created_at",
            "doubts",
        ]

    def get_module(self, obj):
        return {
            "id": obj.module.id,
            "title": obj.module.title,
            "deck": {
                "id": obj.module.deck.id,
                "name": obj.module.deck.name,
            }
        }

class DoubtResponseSerializer(serializers.ModelSerializer):
    teacher = serializers.CharField(source="teacher.username")
    deck_name = serializers.CharField(source="deck.name")
    module_name = serializers.CharField(source="module.title")

    class Meta:
        model = DoubtResponse
        fields = [
            "id",
            "teacher",
            "deck_name",
            "module_name",
            "summary",
            "teacher_response",
            "is_read",
            "created_at",
        ]

