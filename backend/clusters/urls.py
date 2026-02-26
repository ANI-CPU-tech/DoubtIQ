from django.urls import path
from .views import SubmitDoubtView,ModuleClusterView,GenerateClusterSummaryView
from .views import TeacherRespondClusterView,StudentClusterResponseView,DeleteClusterView
from .views import StudentNotificationsView,MarkNotificationReadView,GenerateAITeacherResponseView
from .views import TeacherAllClustersView
urlpatterns=[
    path("modules/<int:module_file_id>/submit/",SubmitDoubtView.as_view()),
    path("modules/<int:module_id>/clusters/",ModuleClusterView.as_view()),
    path("<int:cluster_id>/delete/",DeleteClusterView.as_view()),
    path("<int:cluster_id>/generate-summary/",GenerateClusterSummaryView.as_view()),
    path("<int:cluster_id>/respond/",TeacherRespondClusterView.as_view()),
    path("<int:cluster_id>/response/",StudentClusterResponseView.as_view()),
    path("notifications/",StudentNotificationsView.as_view()),
    path("notifications/<int:response_id>/read/",MarkNotificationReadView.as_view()),
    path("<int:cluster_id>/generate-ai-response/",GenerateAITeacherResponseView.as_view()),
    path("teacher/clusters/", TeacherAllClustersView.as_view()),
]



