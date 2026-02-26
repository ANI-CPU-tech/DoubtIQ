from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from classdecks.models import ModuleFile, Module
from .models import DoubtCluster, DoubtResponse
from .permissions import IsDeckStudent, IsModuleTeacher
from .serializers import DoubtClusterSerializer, DoubtResponseSerializer
from .services import generate_cluster_summary, process_doubt, generate_ai_teacher_response
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
class SubmitDoubtView(APIView):
    permission_classes=[IsAuthenticated,IsDeckStudent]

    def post(self,request,module_file_id):
        text=request.data.get("text")
        module_file_id=self.kwargs["module_file_id"]
        slide_number=request.data.get("slide_number")

        module_file=get_object_or_404(ModuleFile,id=module_file_id)

        cluster=process_doubt(
            student=request.user,
            text=text,
            module_file=module_file,
            slide_number=slide_number,
        )

        return Response({
            "cluster_id":cluster.id,
            "message":"Doubt Submitted Successfully"
        })

class GenerateAITeacherResponseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, cluster_id):
        cluster = get_object_or_404(DoubtCluster, id=cluster_id)

        # Only deck teacher allowed
        if cluster.module.deck.teacher != request.user:
            raise PermissionDenied("Not Allowed")

        doubts = cluster.doubts.all()
        doubts_text = [d.text for d in doubts]

        if not doubts_text:
            return Response({"error": "No doubts found."}, status=400)

        ai_response = generate_ai_teacher_response(doubts_text)

        return Response({
            "ai_generated_response": ai_response
        })

class ModuleClusterView(generics.ListAPIView):
    serializer_class=DoubtClusterSerializer
    permission_classes=[IsAuthenticated,IsModuleTeacher]

    def get_queryset(self):
        module_id=self.kwargs["module_id"]
        module=get_object_or_404(Module,id=module_id)

        if module.deck.teacher !=self.request.user:
            raise PermissionDenied("Not Allowed")

        return DoubtCluster.objects.filter(
            module=module
        ).prefetch_related("doubts")

class StudentNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        responses = request.user.received_notifications.filter(is_read=False)
        serializer = DoubtResponseSerializer(responses, many=True)
        return Response(serializer.data)

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, response_id):
        response_obj = get_object_or_404(
            DoubtResponse,
            id=response_id,
            student=request.user
        )

        response_obj.is_read = True
        response_obj.save()

        return Response({"message": "Marked as read"})

class DeleteClusterView(APIView):
    permission_classes=[IsAuthenticated]

    def delete(self,request,cluster_id):
        cluster=get_object_or_404(DoubtCluster,id=cluster_id)

        if cluster.module.deck.teacher!=request.user:
            raise PermissionDenied("Only Teachers can delete Clusters")

        cluster.delete()

        return Response({
            "message":"Cluster Deleted Successfully!"
        },status=200)

class GenerateClusterSummaryView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,cluster_id):
        cluster=get_object_or_404(DoubtCluster,id=cluster_id)

        if cluster.module.deck.teacher!=request.user:
            raise PermissionDenied("Not Allowed")

        doubts=cluster.doubts.all()
        doubts_text=[d.text for d in doubts]
        
        summary=generate_cluster_summary(doubts_text)
        cluster.summary=summary
        cluster.save()

        return Response({
            "summary":summary
        })

class TeacherRespondClusterView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,cluster_id):
        cluster=get_object_or_404(DoubtCluster,id=cluster_id)

        if cluster.module.deck.teacher!=request.user:
            raise PermissionDenied("Not Allowed")

        response_text=request.data.get("teacher_response")

        if not response_text:
            return Response({"error":"Response cannot be empty"},status=400)

        # Save cluster response
        cluster.teacher_response=response_text
        cluster.resolved=True
        cluster.save()

        # 🔥 Get all unique students in cluster
        students = cluster.doubts.values_list("student", flat=True).distinct()

        # 🔥 Save persistent responses
        for student_id in students:
            DoubtResponse.objects.create(
                student_id=student_id,
                teacher=request.user,
                deck=cluster.module.deck,
                module=cluster.module,
                cluster=cluster,
                summary=cluster.summary,
                teacher_response=response_text
            )

        # 🔥 Broadcast to module chat
        channel_layer = get_channel_layer()
        module_file_id = cluster.doubts.first().module_file.id

        async_to_sync(channel_layer.group_send)(
            f"modulefile_{module_file_id}",
            {
                "type": "teacher_response",
                "cluster_id": cluster.id,
                "summary": cluster.summary,
                "teacher_response": cluster.teacher_response,
            }
        )

        # 🔥 Broadcast global notifications
        for student_id in students:
            async_to_sync(channel_layer.group_send)(
                f"notifications_{student_id}",
                {
                    "type": "new_notification",
                    "deck_name": cluster.module.deck.name,
                    "module_name": cluster.module.title,
                    "summary": cluster.summary,
                    "teacher_response": response_text,
                }
            )

        return Response({
            "message":"Response sent Successfully"
        })

class StudentClusterResponseView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request,cluster_id):
        cluster=get_object_or_404(DoubtCluster,id=cluster_id)

        if not cluster.doubts.filter(student=request.user).exists():
            raise PermissionDenied("You are not a part of this cluster")

        return Response({
            "summary":cluster.summary,
            "teacher_response":cluster.teacher_response,
        })

class TeacherAllClustersView(generics.ListAPIView):
    serializer_class = DoubtClusterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Optional safety check (if you want strict teacher-only access)
        if not hasattr(user, "role") or user.role != "teacher":
            raise PermissionDenied("Only teachers can view clusters.")

        return DoubtCluster.objects.filter(
            module__deck__teacher=user
        ).select_related(
            "module",
            "module__deck"
        ).prefetch_related(
            "doubts"
        ).order_by("-created_at")
