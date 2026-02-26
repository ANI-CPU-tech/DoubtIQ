from rest_framework import serializers
from .models import Deck,ModuleFile,Module
from django.contrib.auth import get_user_model

class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model=Deck
        fields=['id','name','description','created_at','deck_code']
        read_only_fields=['created_at','deck_code']

class JoinDeckSerializer(serializers.Serializer):
    deck_code=serializers.CharField(max_length=10)

    def validate(self,attrs):
        try:
            deck=Deck.objects.get(deck_code=attrs["deck_code"])
        except Deck.DoesNotExist:
            raise serializers.ValidationError("Invalid Deck code")
        
        attrs["deck"]=deck
        return attrs

class ModuleFileSerializer(serializers.ModelSerializer):
    class Meta:
        model=ModuleFile
        fields=['id','file','converted_pdf','file_type','uploaded_at']
        read_only_fields=['converted_pdf','file_type','uploaded_at']

    def validate_file(self,value):
        filename=value.name.lower()

        if filename.endswith('.pptx'):
            return value
        elif filename.endswith('.pdf'):
            return value
        raise serializers.ValidationError(
            "Only .pptx and .pdf file are allowed"
        )

class ModuleSerializer(serializers.ModelSerializer):
    files=ModuleFileSerializer(many=True,read_only=True)
    
    class Meta:
        model=Module
        fields=['id','title','description','created_at','files']
        read_only_fields=['created_at']

class DeckDetailSerializer(serializers.ModelSerializer):
    modules=ModuleSerializer(many=True,read_only=True)

    class Meta:
        model=Deck
        fields=[
            'id',
            'name',
            'description',
            'created_at',
            'deck_code',
            'modules',
        ]

User=get_user_model()
class DeckStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','username','email']

