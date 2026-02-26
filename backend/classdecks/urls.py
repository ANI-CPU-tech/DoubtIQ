from django.urls import path
from .views import CreateDeckView,JoinDeckView,StudentDecksView,TeacherDecksView,DeckDetailView
from .views import UpdateDeckView,DeleteDeckView,LeaveDeckView,KickStudentView
from .views import CreateModuleView,UploadModuleFileView,DeckModulesView,DeckFullDetailView
from .views import UpdateModuleView,DeleteModuleView,DeleteModuleFileView,DeckStudentsListView
from .views import TeacherDeckCodesView,ModuleConvertedPDFsView
urlpatterns=[
    path('create/',CreateDeckView.as_view()),
    path('join/',JoinDeckView.as_view()),
    path('joined/',StudentDecksView.as_view()),
    path('created/',TeacherDecksView.as_view()),
    path('details/<int:pk>/',DeckDetailView.as_view()),
    path('delete/<int:pk>/',DeleteDeckView.as_view()),
    path('update/<int:pk>/',UpdateDeckView.as_view()),
    path('leave/<int:pk>/',LeaveDeckView.as_view()),
    path('kick/<int:pk>/',KickStudentView.as_view()),
    path("teacher/deck-codes/", TeacherDeckCodesView.as_view()),
]

urlpatterns+=[
    path('<int:deck_id>/modules/create/',CreateModuleView.as_view()),
    path('<int:deck_id>/modules/',DeckModulesView.as_view()),
    path('modules/<int:module_id>/upload/',UploadModuleFileView.as_view()),
    path('<int:pk>/full/',DeckFullDetailView.as_view()),
    path('modules/<int:pk>/update/',UpdateModuleView.as_view()),
    path('modules/<int:pk>/delete/',DeleteModuleView.as_view()),
    path('module-files/<int:pk>/delete/',DeleteModuleFileView.as_view()),
    path('<int:pk>/students/',DeckStudentsListView.as_view()),
    path("modules/<int:module_id>/converted-pdfs/", ModuleConvertedPDFsView.as_view()), 
]
