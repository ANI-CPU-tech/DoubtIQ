from django.urls import path
from .views import RegisterView,TeacherView,StudentView,LogoutView,StudentProfileView,TeacherProfileView
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView

urlpatterns=[
    path('register/',RegisterView.as_view(),name='register'),
    path('login/',TokenObtainPairView.as_view(),name='token_obtain_pair'),
    path('refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('teacher/login/',TeacherView.as_view()),
    path('student/login/',StudentView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('student/profile/', StudentProfileView.as_view()),
    path('teacher/profile/', TeacherProfileView.as_view()),
]
