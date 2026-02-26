from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from classdecks.models import ModuleFile
import json
from asgiref.sync import sync_to_async


class ModuleFileConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group_name = None
        self.user = self.scope["user"]
        self.module_file_id = self.scope["url_route"]["kwargs"]["module_file_id"]

        if not self.user or isinstance(self.user, AnonymousUser):
            return await self.close()

        # 🔥 Wrap ALL DB logic inside sync_to_async
        has_access = await self.check_permission()

        if not has_access:
            return await self.close()

        self.group_name = f"modulefile_{self.module_file_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    @sync_to_async
    def check_permission(self):
        try:
            module_file = ModuleFile.objects.select_related(
                "module__deck"
            ).get(id=self.module_file_id)
        except ModuleFile.DoesNotExist:
            return False

        deck = module_file.module.deck

        if deck.teacher == self.user:
            return True

        if deck.student.filter(id=self.user.id).exists():
            return True

        return False

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def teacher_response(self, event):
        await self.send(text_data=json.dumps({
            "cluster_id": event["cluster_id"],
            "summary": event["summary"],
            "teacher_response": event["teacher_response"],
        }))

class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]

        if not self.user or self.user.is_anonymous:
            return await self.close()

        self.group_name = f"notifications_{self.user.id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def new_notification(self, event):
        await self.send(text_data=json.dumps({
            "deck_name": event["deck_name"],
            "module_name": event["module_name"],
            "summary": event["summary"],
            "teacher_response": event["teacher_response"],
        }))
