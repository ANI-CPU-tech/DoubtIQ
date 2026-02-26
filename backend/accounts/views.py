from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import RegisterSerializer
from .models import User
from rest_framework import generics
from .permissions import isTeacher,isStudent
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

class RegisterView(generics.CreateAPIView):
    queryset=User.objects.all()
    serializer_class=RegisterSerializer

class TeacherView(APIView):
    permission_classes=[isTeacher]

    def get(self,request):
        return Response({'message':f'Hello {request.user.username}'})

class StudentView(APIView):
    permission_classes=[isStudent]

    def get(self,request):
        return Response({'message':f'Hello {request.user.username}'})

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Logout successful"},
                status=status.HTTP_205_RESET_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "username": user.username,
            "email": user.email,
            "role": user.role,
        })

class TeacherProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "username": user.username,
            "email": user.email,
            "role": user.role,
        })
