from rest_framework.permissions import BasePermission
from classdecks.models import ModuleFile

class IsDeckStudent(BasePermission):
    def has_permission(self,request,view):

        module_file_id=view.kwargs.get("module_file_id")
        if not module_file_id:
            return False

        try:
            module_file=ModuleFile.objects.select_related("module__deck").get(
                id=module_file_id
            )
        except ModuleFile.DoesNotExist:
            return False

        deck=module_file.module.deck

        return (
            request.user.is_authenticated and
            request.user.role == "student" and 
            request.user in deck.student.all()
        )

class IsModuleTeacher(BasePermission):
    def has_permission(self,request,view):
        return(
            request.user.is_authenticated and
            request.user.role=="teacher"
        )
