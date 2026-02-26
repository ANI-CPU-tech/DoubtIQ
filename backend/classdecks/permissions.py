from rest_framework.permissions import BasePermission
from .models import Deck
class IsDeckMember(BasePermission):
    def has_object_permission(self,request,view,obj):
        return (
            obj.teacher==request.user or request.user in obj.student.all()
        )

class IsDeckOwner(BasePermission):
    def has_object_permission(self,request,view,obj):
        return (
            request.user.is_authenticated and 
            request.user.role=="teacher" and
            obj.teacher==request.user
        )

class IsDeckTeacher(BasePermission):
    def has_permission(self,request,view):
        deck_id=view.kwargs.get("deck_id")

        if not deck_id:
            return False

        try:
            deck=Deck.objects.get(id=deck_id)
        except Deck.DoesNotExist:
            return False

        return (
            request.user.is_authenticated and
            request.user.role == "teacher" and
            deck.teacher==request.user
        )

class IsModuleDeckTeacher(BasePermission):
    def has_object_permission(self,request,view,obj):
        if hasattr(obj,"deck"):
            return(
                request.user.is_authenticated and
                request.user.role=="teacher" and
                obj.deck.teacher==request.user
            )

        if hasattr(obj,"module"):
            return(
                request.user.is_authenticated and
                request.user.role=="teacher" and
                obj.module.deck.teacher==request.user
            )

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "teacher"
        )
        
