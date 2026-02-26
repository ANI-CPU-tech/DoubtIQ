from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/modulefile/(?P<module_file_id>\d+)/$", consumers.ModuleFileConsumer.as_asgi()),
    re_path(r"ws/notifications/$", consumers.NotificationConsumer.as_asgi()),
]
