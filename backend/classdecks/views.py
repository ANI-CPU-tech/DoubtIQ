from django.shortcuts import render
from accounts.permissions import isTeacher,isStudent
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import DeckSerializer,JoinDeckSerializer,ModuleSerializer,ModuleFileSerializer
from rest_framework.views import APIView
from .models import Deck,Module,ModuleFile
from .permissions import IsDeckMember,IsDeckOwner,IsDeckTeacher,IsModuleDeckTeacher
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .serializers import DeckDetailSerializer,DeckStudentSerializer
from django.db.models import Prefetch
import subprocess
import os
from django.db import transaction
from rest_framework import serializers
from django.core.files import File
from rest_framework.exceptions import ValidationError

class CreateDeckView(generics.CreateAPIView):
    serializer_class=DeckSerializer
    permission_classes=[IsAuthenticated,isTeacher]

    def perform_create(self,serializer):
        serializer.save(teacher=self.request.user)

class JoinDeckView(APIView):
    permission_classes=[IsAuthenticated]
    
    def post(self,request):
        serializer=JoinDeckSerializer(data=request.data)

        if serializer.is_valid():
            deck=serializer.validated_data["deck"]

            if request.user.role!='student':
                return Response({'error':'Only Student can join'},status=403)

            deck.student.add(request.user)
            return Response({'message':'Joined Successfully'},status=200)
        return Response(serializer.errors,status=400)

class StudentDecksView(generics.ListAPIView):
    serializer_class=DeckSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return self.request.user.joined_decks.all()

class TeacherDecksView(generics.ListAPIView):
    serializer_class=DeckSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return self.request.user.created_decks.all()

class DeckDetailView(generics.RetrieveAPIView):
    queryset=Deck.objects.all()
    serializer_class=DeckSerializer
    permission_classes=[IsAuthenticated,IsDeckMember]

class UpdateDeckView(generics.RetrieveUpdateAPIView):
    queryset=Deck.objects.all()
    serializer_class=DeckSerializer
    permission_classes=[IsAuthenticated,IsDeckOwner]

class DeleteDeckView(generics.DestroyAPIView):
    queryset=Deck.objects.all()
    serializer_class=DeckSerializer
    permission_classes=[IsAuthenticated,IsDeckOwner]

class LeaveDeckView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,pk):
        deck=get_object_or_404(Deck,pk=pk)

        if request.user.role!='student':
            return Response({"error":"Only Students Can Leave Deck"},status=403)
        
        if request.user not in deck.student.all():
            return Response({"error":"You are not part of this Deck"},status=400)
        
        deck.student.remove(request.user)
        return Response({"message":"Successfully left the deck"},status=200)

User=get_user_model()
class KickStudentView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,pk):
        deck=get_object_or_404(Deck,pk=pk)

        if request.user.role!='teacher' or deck.teacher!=request.user:
            return Response({'error':'You are not allowed to kick students'},status=403)
        
        student_id=request.data.get("student_id")

        if not student_id:
            return Response({'error':'StudentID required'},status=400)

        student=get_object_or_404(User,id=student_id)

        if student.role!="student":
            return Response({"error":"You can only kick students"},status=400)

        if student not in deck.student.all():
            return Response({"error":"Student not in deck"},status=400)

        deck.student.remove(student)
        return Response({"message":"Student Kicked"},status=200)

class CreateModuleView(generics.CreateAPIView):
    serializer_class=ModuleSerializer
    permission_classes=[IsAuthenticated,IsDeckTeacher]

    def perform_create(self,serializer):
        deck=Deck.objects.get(id=self.kwargs["deck_id"])
        serializer.save(deck=deck)

def convert_ppt_to_pdf(ppt_path):
    output_dir=os.path.dirname(ppt_path)

    subprocess.run([
        'libreoffice',
        '--headless',
        '--convert-to',
        'pdf',
        ppt_path,
        '--outdir',
        output_dir
    ],check=True)
    
    base_name=os.path.splitext(ppt_path)[0]
    pdf_path=base_name+'.pdf'

    if not os.path.exists(pdf_path):
        raise FileNotFoundError("PDF conversion failed")

    return pdf_path

class UploadModuleFileView(generics.CreateAPIView):
    serializer_class=ModuleFileSerializer
    permission_classes=[IsAuthenticated,IsModuleDeckTeacher]
    
    @transaction.atomic
    def perform_create(self,serializer):
        module=get_object_or_404(Module, id=self.kwargs["module_id"])
        instance=serializer.save(module=module)

        file_path=instance.file.path
        filename=file_path.lower()

        if filename.endswith('.pptx'):
            instance.file_type='ppt'

            try:
                pdf_path=convert_ppt_to_pdf(file_path)
                with open(pdf_path,'rb') as pdf_file:
                    instance.converted_pdf.save(
                        os.path.basename(pdf_path),
                        File(pdf_file),
                        save=False
                    )
                os.remove(pdf_path)
            except Exception as e:
                print("Actual Error:",e)
                raise ValidationError("PPT Conversion Failed")

        elif filename.endswith('.pdf'):
            instance.file_type='pdf'

        else:
            instance.delete()
            raise serializers.ValidationError("Invalid File Type")
        instance.save()

class DeckModulesView(generics.ListAPIView):
    serializer_class=ModuleSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        deck=Deck.objects.get(id=self.kwargs["deck_id"])

        if(
            deck.teacher==self.request.user or
            self.request.user in deck.student.all()
        ):
            return deck.modules.all()

        raise PermissionDenied("Not allowed to view modules")

class DeckFullDetailView(generics.RetrieveAPIView):
    serializer_class=DeckDetailSerializer
    permission_classes=[IsAuthenticated,IsDeckMember]

    def get_queryset(self):
        return Deck.objects.prefetch_related(
            Prefetch(
                'modules',
                queryset=Module.objects.prefetch_related('files')
            )
        )

class UpdateModuleView(generics.RetrieveUpdateAPIView):
    queryset=Module.objects.all()
    serializer_class=ModuleSerializer
    permission_classes=[IsAuthenticated,IsModuleDeckTeacher]

class DeleteModuleView(generics.DestroyAPIView):
    queryset=Module.objects.all()
    permission_classes=[IsAuthenticated,IsModuleDeckTeacher]

class DeleteModuleFileView(generics.DestroyAPIView):
    queryset=ModuleFile.objects.all()
    permission_classes=[IsAuthenticated,IsModuleDeckTeacher]

class DeckStudentsListView(generics.ListAPIView):
    serializer_class = DeckStudentSerializer
    permission_classes = [IsAuthenticated, IsDeckMember]

    def get_queryset(self):
        deck = get_object_or_404(Deck, pk=self.kwargs["pk"])
        return deck.student.all()

class TeacherDeckCodesView(APIView):
    permission_classes = [IsAuthenticated, isTeacher]

    def get(self, request):
        decks = Deck.objects.filter(
            teacher=request.user
        ).values(
            "id",
            "name",
            "deck_code"
        )

        return Response({
            "decks": list(decks)
        })

class ModuleConvertedPDFsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, module_id):
        module = get_object_or_404(Module, id=module_id)
        deck = module.deck

        # Permission check (teacher OR student in deck)
        if not (
            deck.teacher == request.user or
            request.user in deck.student.all()
        ):
            raise PermissionDenied("Not allowed to view this module")

        files = module.files.filter(converted_pdf__isnull=False)

        data = [
            {
                "file_id": f.id,
                "original_file": f.file.url,
                "converted_pdf": f.converted_pdf.url,
                "file_type": f.file_type,
                "uploaded_at": f.uploaded_at,
            }
            for f in files
        ]

        return Response({
            "module_id": module.id,
            "module_title": module.title,
            "converted_pdfs": data
        })



